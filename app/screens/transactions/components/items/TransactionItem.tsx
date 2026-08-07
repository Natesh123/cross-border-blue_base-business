import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, Platform, StyleSheet } from "react-native";
import Vector from "app/assets/vectors";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import CountryFlag from "react-native-country-flag";
import { FONTS, SIZES } from "app/constants/Assets";
import Colors from "app/constants/Colors";
import styles from "app/styles";
import { dateFormat } from "app/helpers";
import { GetReceiverInfoList, GetRemitterProfile, GetTransactionDetails } from "app/http-services";
import { useIsFocused } from "@react-navigation/native";
import { useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import { LinearGradient } from "expo-linear-gradient";
import { ITransaction } from "types";
import moment from "moment";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";


interface IProps {
  item: any;
}

const TransactionItem = ({ item }: IProps) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const getCountryISO2 = require("country-iso-3-to-2");
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const currentToken = useRecoilValue(ProfileState);
  const [recipientList, setRecipientList] = useState<any[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<any[]>([]);
  const [remitterProfile, setRemitterProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [transactionType, setTransactionType] =
    useState<"MONEY_REMITTANCE" | "AIRTOPUP">("MONEY_REMITTANCE");

  const isWalletTxn = 
    item.TransactionType === "WALLET" ||
    item.TransactionMode === "E-Wallet Debit" ||
    (item.TransID && item.TransID.toString().startsWith("EE"));

  // ✅ Fetch Receiver List
  const fetchReceiverList = async (tokenId: string, remitterId: string) => {
    try {
      const response = await GetReceiverInfoList(tokenId);
      if (response.status === 200) {
        const _data = response?.data?.ReceiverDetails;

        if (Array.isArray(_data) && _data.length > 0) {
          // Group by country
          const grouped = _data.reduce((acc: any, curr: any) => {
            const country = curr.Country || "Unknown";
            acc[country] = acc[country] ? [...acc[country], curr] : [curr];
            return acc;
          }, {});

          // Sort recipients inside each country
          Object.keys(grouped).forEach((country) => {
            grouped[country].sort((a: { FirstName: any; LastName: any; }, b: { FirstName: any; LastName: any; }) => {
              const nameA = `${a.FirstName || ""} ${a.LastName || ""}`.toLowerCase();
              const nameB = `${b.FirstName || ""} ${b.LastName || ""}`.toLowerCase();
              return nameA.localeCompare(nameB);
            });
          });

          const sortedList = Object.keys(grouped)
            .sort((a, b) => a.localeCompare(b))
            .map((country) => ({
              country,
              recipients: grouped[country],
            }));

          setRecipientList(sortedList);
          setFilteredRecipients(sortedList);
          return sortedList;
        } else {
          setRecipientList([]);
          setFilteredRecipients([]);
          return [];
        }
      }
    } catch (err) {
      console.error("Fetch recipients details:", err);
      return [];
    }
  };

  // ✅ Fetch Remitter Profile
  const fetchRemitterProfile = async (tokenId: string, remitterId: string) => {
    try {
      const response = await GetRemitterProfile(tokenId);
      if (response.status === 200 && response.data.Sender) {
        const profile = response.data.Sender;
        setRemitterProfile(profile);
        return profile;
      }
    } catch (err) {
      console.error("Error fetching Remitter Profile:", err);
      return null;
    }
    return null;
  };
  // ✅ Modified fetchTransactionDetails to return data
  const fetchTransactionDetails = async (
    period: "ALL" | "1MONTH" | "6MONTH" | "1YEAR",
    transType: string
  ) => {
    setLoading(true);
    setTransactionType(transType as any);

    let fromDate = "";
    let toDate = moment().format("YYYY-MM-DD");

    const request = {
      tokenId: currentToken.tokenId,
      remitterId: currentToken.remitterId,
      fromDate,
      toDate,
      numberTranList: "0",
      tranList: "COUNT",
      transId: "",
      transactionType: transType,
      walletMode: "Sendmoney",
    };

    try {
      const res: any = await GetTransactionDetails(request);

      if (res.status === 200 && res.data?.TransDetails?.length > 0) {

        // 🔥 FIX EMPTY TRANSACTION MODE HERE
        const fixedList = (res?.data?.TransDetails || []).map((t: any) => {
          console.log("TransactionMode Raw =>", JSON.stringify(t.TransactionMode));

          return {
            ...t,
            TransactionMode:
              !t.TransactionMode || t.TransactionMode.trim() === ""
                ? "E-Wallet Debit"
                : t.TransactionMode,
          };
        });


        const sorted = fixedList.sort((a: ITransaction, b: ITransaction) =>
          (a.DestinationCountry || "").localeCompare(b.DestinationCountry || "")
        );

        setTransactions(sorted);
        return sorted;
      } else {
        setTransactions([]);
        return [];
      }
    } catch (err: any) {
      console.error("Fetch Transaction details", err.response?.data?.message);
      return [];
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };





  const handleDownload = async (transactionItem: ITransaction) => {
    try {
      setLoading(true);

      const remitter = await fetchRemitterProfile(
        currentToken.tokenId,
        currentToken.remitterId
      );

      // 👉 If you really need receiver details from API, keep this.
      // But for now we will just pick the first one as before.
      const receiverList = await fetchReceiverList(
        currentToken.tokenId,
        currentToken.remitterId
      );
      const receiveinfo = receiverList?.[0]?.recipients?.[0] || null;

      // ✅ Use the clicked item's data instead of fetching all transactions again
      const transaction = transactionItem;
      console.log("✅ Transaction details:", transaction);

      if (!remitter) {
        Alert.alert(
          "Error",
          "Unable to fetch Remitter details. Please try again."
        );
        return;
      }



      const transactionDateTime = transaction?.TransactionDate || "";
      let txnDate = "--";
      let txnTime = "--";

      if (transactionDateTime) {
        const [datePart, timePart, ampm] = transactionDateTime.split(" ");
        txnDate = datePart || "--";
        txnTime = timePart ? `${timePart} ${ampm || ""}` : "--";
      }

      const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #000; padding: 20px; }
            .header { text-align: center; }
            .logo { width: 150px; }
            .company { font-size: 12px; margin-top: 10px; }
            .title { font-weight: bold; font-size: 16px; margin: 10px 0; text-transform: uppercase; }
            .txn-id { font-size: 12px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { text-align: left; vertical-align: top; padding: 6px 8px; border: 1px solid #ccc; }
            th { background: #f3f3f3; font-weight: bold; }
            .footer { font-size: 10px; margin-top: 20px; color: #333; line-height: 1.4; text-align: justify; }
            .important { color: red; font-weight: bold; font-size: 11px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img class="logo" src="../../assets/logos/logo.png" />
            <div class="company">
              Cross Border Limited<br/>
              1st Floor, Tidelpark, Adyar, Chennai, India, 600073<br/>
              customersupport@crossborder.com | +44-207 132 0015
            </div>
            <div class="title">CUSTOMER RECEIPT</div>
            <div class="txn-id">TXN ID: ${transaction?.TransID || ""}</div>
          </div>

          <table class="no-border">
            <tr>
              <td><b>Txn. Date:</b> ${txnDate}</td>
              <td><b>Service opted for:</b> ${transaction?.TransferType || ""}</td>
            </tr>
            <tr>
              <td><b>Txn. Time:</b> ${txnTime}</td>
              <td><b>Payout Country:</b> ${transaction?.DestinationCountry || "IND"}</td>
            </tr>
          </table>

          <table>
            <tr>
              <th>BENEFICIARY DETAILS</th>
              <th>PAYMENT DETAILS</th>
            </tr>
            <tr>
              <td>
                Beneficiary Name: ${transaction?.ReceiverFirstName || ""} ${transaction?.ReceiverLastName || ""}<br/>
                Country: ${transaction?.Country || "India"}<br/>
                Acc No. / IBAN: ${receiveinfo?.AccountNumber || "--"}/${receiveinfo?.IFSC_IBAN || "--"}<br/>
                Bank Name / Bank Code: ${receiveinfo?.BankName || "--"}/${receiveinfo?.BankCode || "--"}<br/>
                Bank Branch: ${receiveinfo?.BranchCode || "--"}<br/>
                Mobile: ${receiveinfo?.MobileNumber || "--"}
              </td>
              <td>
                Receive Currency: ${transaction?.DestinationCountry || "--"}<br/>
                Mode of payment: ${transaction?.TransactionMode || "--"}<br/>
                Receive amount: "0.00"<br/>
                Send amount: ${transaction?.Amount || "0.00"}<br/>
                Exchange Rate: "0.000000"<br/>
                Other Taxes: "0.00"<br/>
                Commission: "0.00"<br/>
                Transfer Fee: "0.00"<br/>
                Total: ${transaction?.Amount || "0.00"}<br/>
                Amount in words:"--"<br/>
              </td>
            </tr>
          </table>

          <table>
            <tr><th colspan="2">REMITTER DETAILS</th></tr>
            <tr>
              <td>
                Remitter ID: ${remitter.RemitterID || "--"}<br/>
                Remitter Address: ${remitter.Address1 || ""}, ${remitter.Address2 || ""},
                ${remitter.CountryName || ""}<br/>
                State: ${remitter.State || "--"}<br/>
                Postal Code: ${remitter.PostCode || "--"}<br/>
                Mobile: ${remitter.Mobile || "--"}<br/>
                Source Income: ${remitter.SourceIncome || "--"}<br/>
              </td>
              <td>
                Remitter Name: Mr.${remitter.FirstName || ""} ${remitter.LastName || ""}<br/>
                City: ${remitter.City || "--"}<br/>
                Country: ${remitter.CountryName || "--"}<br/>
                Nationality: ${remitter.Nationality || "--"}<br/>
                Purpose of txn: ${remitter.RemittancePurpose || "Investment in real estate"}
              </td>
            </tr>
          </table>

          <div class="important">Important Notice:</div>
          <div class="footer">
            This transaction is initiated and the payment is received by us on your request and is subject to applicable rules and regulations and terms and conditions.
            <br/><br/>
            1. We shall not be responsible if the information provided by the Sender is inadequate or incorrect.<br/>
            2. We reserve the right to decline/refuse to process this transaction if it is found that the information provided or document(s) submitted by the Sender as proof for processing the transaction is not true and/or valid or violates any applicable law.<br/>
            3. If the Receiver is opting for transaction amount in a different payout currency other than the currency opted by the Sender (if available), then it may cause additional charges to the Receiver.<br/>
            4. Sender is allowed to challenge the error within 13 months and obtain proper rectification.<br/>
            5. For assistance the Sender can contact <b>09999999999</b> or <b>customersupport@Cross Border.com</b>.<br/>
            <br/><b>Cross Border is a trading name of Cross Border Fintech Limited and is authorised & regulated by the Financial Conduct Authority.</b>
          </div>
        </body>
      </html>
    `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("PDF Generated", "Saved at: " + uri);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate PDF.");
    } finally {
      setLoading(false);
    }
  };


  // const handleDownload = async () => {
  //   try {
  //     setLoading(true);

  //     const remitter = await fetchRemitterProfile(currentToken.tokenId, currentToken.remitterId);
  //     const receiverList = await fetchReceiverList(currentToken.tokenId, currentToken.remitterId);
  //     const receiveinfo = receiverList?.[0]?.recipients?.[0] || null;
  //     const transactions = await fetchTransactionDetails("ALL", "ALL");
  //     const transaction = transactions?.[0] || null;
  //     console.log("✅ Transaction details:", transaction);

  //     if (!remitter) {
  //       Alert.alert("Error", "Unable to fetch Remitter details. Please try again.");
  //       return;
  //     }

  //     const transactionDateTime = transaction?.TransactionDate || "";
  //     let txnDate = "--";
  //     let txnTime = "--";

  //     if (transactionDateTime) {
  //       const [datePart, timePart, ampm] = transactionDateTime.split(" ");
  //       txnDate = datePart || "--";
  //       txnTime = timePart ? `${timePart} ${ampm || ""}` : "--";
  //     }

  //     // ✅ Define HTML content before using it
  //     const htmlContent = `
  //     <html>
  //       <head>
  //         <style>
  //           body { font-family: Arial, sans-serif; font-size: 12px; color: #000; padding: 20px; }
  //           .header { text-align: center; }
  //           .logo { width: 150px; }
  //           .company { font-size: 12px; margin-top: 10px; }
  //           .title { font-weight: bold; font-size: 16px; margin: 10px 0; text-transform: uppercase; }
  //           .txn-id { font-size: 12px; margin-bottom: 10px; }
  //           table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  //           th, td { text-align: left; vertical-align: top; padding: 6px 8px; border: 1px solid #ccc; }
  //           th { background: #f3f3f3; font-weight: bold; }
  //           .footer { font-size: 10px; margin-top: 20px; color: #333; line-height: 1.4; text-align: justify; }
  //           .important { color: red; font-weight: bold; font-size: 11px; margin-top: 20px; }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="header">
  //           <img class="logo" src="../../assets/logos/logo.png" />
  //           <div class="company">
  //             Cross Border Limited<br/>
  //             1st Floor, Tidelpark, Adyar, Chennai, India, 600073<br/>
  //             customersupport@Cross Border.com | +44-207 132 0015
  //           </div>
  //           <div class="title">CUSTOMER RECEIPT</div>
  //           <div class="txn-id">TXN ID: ${transaction?.TransID || "RAU0000011807"}</div>
  //         </div>

  //         <table class="no-border">
  //           <tr>
  //             <td><b>Txn. Date:</b> ${txnDate}</td>
  //             <td><b>Service opted for:</b> ${transaction?.TransferType || ""}</td>
  //           </tr>
  //           <tr>
  //             <td><b>Txn. Time:</b> ${txnTime}</td>
  //             <td><b>Payout Country:</b> ${transaction?.DestinationCountry || "IND"}</td>
  //           </tr>
  //         </table>

  //         <table>
  //           <tr>
  //             <th>BENEFICIARY DETAILS</th>
  //             <th>PAYMENT DETAILS</th>
  //           </tr>
  //           <tr>
  //             <td>
  //               Beneficiary Name: ${receiveinfo?.FirstName || ""} ${receiveinfo?.LastName || ""}<br/>
  //               Country: ${receiveinfo?.Country || "--"}<br/>
  //               Acc No. / IBAN: ${receiveinfo?.AccountNumber || "--"}/${receiveinfo?.IFSC_IBAN || "--"}<br/>
  //               Bank Name / Bank Code: ${receiveinfo?.BankName || "--"}/${receiveinfo?.BankCode || "--"}<br/>
  //               Bank Branch: ${receiveinfo?.BranchCode || "--"}<br/>
  //               Mobile: ${receiveinfo?.MobileNumber || "--"}
  //             </td>
  //             <td>
  //               Receive Currency: ${transaction?.DestinationCountry || "--"}<br/>
  //               Mode of payment: ${transaction?.TransactionMode || "--"}<br/>
  //               Receive amount: "0.00"<br/>
  //               Send amount: ${receiveinfo?.Amount || "4.00"}<br/>
  //               Exchange Rate: "0.000000"<br/>
  //               Other Taxes: "0.00"<br/>
  //               Commission: "0.00"<br/>
  //               Transfer Fee: "0.00"<br/>
  //               Total: ${receiveinfo?.Amount || "10.00"}<br/>
  //               Amount in words:"--"<br/>
  //             </td>
  //           </tr>
  //         </table>

  //         <table>
  //           <tr><th colspan="2">REMITTER DETAILS</th></tr>
  //           <tr>
  //             <td>
  //               Remitter ID: ${remitter.RemitterID || "--"}<br/>
  //               Address: ${remitter.Address1 || ""}, ${remitter.Address2 || ""}<br/>
  //               ${remitter.City || ""}, ${remitter.CountryName || ""}<br/>
  //               Postal: ${remitter.PostCode || "--"}<br/>
  //               Mobile: ${remitter.Mobile || "--"}<br/>
  //             </td>
  //             <td>
  //               Name: ${remitter.FirstName || ""} ${remitter.LastName || ""}<br/>
  //               Nationality: ${remitter.Nationality || "--"}<br/>
  //               Source Income: ${remitter.SourceIncome || "--"}<br/>
  //               Purpose: ${remitter.RemittancePurpose || "--"}
  //             </td>
  //           </tr>
  //         </table>

  //         <div class="important">Important Notice:</div>
  //         <div class="footer">
  //           This transaction is initiated and the payment is received by us on your request and is subject to applicable rules and regulations and terms and conditions.
  //           <br/><br/>
  //           1. We shall not be responsible if the information provided by the Sender is inadequate or incorrect.<br/>
  //           2. We reserve the right to decline/refuse to process this transaction if it is found that the information provided or document(s) submitted by the Sender as proof for processing the transaction is not true and/or valid or violates any applicable law.<br/>
  //           3. If the Receiver is opting for transaction amount in a different payout currency other than the currency opted by the Sender (if available), then it may cause additional charges to the Receiver.<br/>
  //           4. Sender is allowed to challenge the error within 13 months and obtain proper rectification.<br/>
  //           5. For assistance the Sender can contact <b>09999999999</b> or <b>customersupport@Cross Border.com</b>.<br/>
  //           <br/><b>Cross Border is a trading name of Cross Border Fintech Limited and is authorised & regulated by the Financial Conduct Authority.</b>
  //         </div>
  //       </body>
  //     </html>
  //   `;

  //     // ✅ Generate PDF only once
  //     const { uri } = await Print.printToFileAsync({ html: htmlContent });
  //     if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(uri); }
  //     else { Alert.alert("PDF Generated", "Saved at: " + uri); }
  //   } catch (error) { console.error(error); Alert.alert("Error", "Failed to generate PDF."); } finally { setLoading(false); }
  // };




  return (
    <View style={localStyles.cardContainer}>
      {/* status indicator bar */}
      <View style={[
        localStyles.statusBar,
        { backgroundColor: item.TranStatus === "Success" ? "#22c55e" : item.TranStatus === "Failed" || item.TranStatus === "Rejected" ? "#ef4444" : "#f59e0b" }
      ]} />

      <View style={localStyles.cardInner}>
        {/* top row: Flag + Name + Amount */}
        <View style={localStyles.cardHeader}>
          <View style={localStyles.receiverBox}>
            <View style={localStyles.flagShell}>
              {getCountryISO2(item.DestinationCountry) ? (
                <CountryFlag
                  style={localStyles.flagImg}
                  isoCode={getCountryISO2(item.DestinationCountry)}
                  size={20}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>💵</Text>
              )}
            </View>
            <View style={localStyles.receiverInfo}>
              <Text style={localStyles.receiverName} numberOfLines={1}>
                {item.ReceiverFirstName} {item.ReceiverLastName}
              </Text>
              <Text style={localStyles.txnIdText}>{item.TransID}</Text>
            </View>
          </View>

          <View style={localStyles.amountBox}>
            <Text style={localStyles.amountText}>{item.Currency}{item.Amount}</Text>
          </View>
        </View>

        {/* middle row: Mode + Date */}
        <View style={localStyles.detailsRow}>
          <View style={localStyles.infoPill}>
            <Vector as="materialcommunityicons" name="swap-horizontal" size={14} color="#64748b" />
            <Text style={localStyles.detailValue}>{item.TransactionMode}</Text>
          </View>
          <Text style={localStyles.dateText}>{dateFormat(item.TransactionDate)}</Text>
        </View>

        {/* bottom row: Status + Actions */}
        <View style={localStyles.cardFooter}>
          <View style={[
            localStyles.statusPill,
            { backgroundColor: item.TranStatus === "Success" ? "#f0fdf4" : item.TranStatus === "Failed" || item.TranStatus === "Rejected" ? "#fef2f2" : "#fffbeb" }
          ]}>
            <View style={[
              localStyles.statusDot,
              { backgroundColor: item.TranStatus === "Success" ? "#22c55e" : item.TranStatus === "Failed" || item.TranStatus === "Rejected" ? "#ef4444" : "#f59e0b" }
            ]} />
            <Text style={[
              localStyles.statusTxt,
              { color: item.TranStatus === "Success" ? "#15803d" : item.TranStatus === "Failed" || item.TranStatus === "Rejected" ? "#b91c1c" : "#b45309" }
            ]}>
              {item.TranStatus}
            </Text>
          </View>

          <View style={localStyles.actionGroup}>
            <TouchableOpacity
              onPress={() => setShowViewModal(true)}
              style={localStyles.actionBtnSmall}
            >
              <Vector as="feather" name="eye" size={16} color="#0ea5e9" />
              <Text style={[localStyles.actionBtnTxt, { color: '#0ea5e9' }]}>View</Text>
            </TouchableOpacity>

            {item.TranStatus === "Success" && !isWalletTxn && (
              <TouchableOpacity
                onPress={() => handleDownload(item)}
                style={[localStyles.actionBtnSmall, { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }]}
              >
                <Vector as="feather" name="download" size={16} color="#22c55e" />
                <Text style={[localStyles.actionBtnTxt, { color: '#15803d' }]}>Receipt</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ======================== ELITE FLOATING RECEIPT MODAL ========================= */}
      <Modal visible={showViewModal} transparent animationType="fade">
        <View style={localStyles.receiptOverlay}>
          <View style={localStyles.receiptCard}>
            
            {/* Top Stub (The Hero) */}
            <LinearGradient
              colors={
                item.TranStatus === "Success" ? ['#0ea5e9', '#0284c7'] :
                  item.TranStatus === "Failed" || item.TranStatus === "Rejected" ? ["#ef4444", "#dc2626"] :
                    ["#f59e0b", "#d97706"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.ticketStub}
            >
              <View style={localStyles.ticketIconBox}>
                <Vector
                  as="materialcommunityicons"
                  name={item.TranStatus === "Success" ? "check-decagram" : "alert-decagram"}
                  size={42}
                  color="#FFF"
                />
              </View>
              <Text style={localStyles.ticketStatusText}>{item.TranStatus.toUpperCase()}</Text>
              
              <View style={localStyles.ticketAmountBox}>
                <Text style={localStyles.ticketCurrency}>{item.Currency}</Text>
                <Text style={localStyles.ticketAmount}>{item.Amount}</Text>
              </View>
              
              <Text style={localStyles.ticketTxnId}>TXN-ID: {item.TransID}</Text>
              
              {/* Corner Close on the Stub */}
              <TouchableOpacity
                onPress={() => setShowViewModal(false)}
                style={localStyles.ticketCloseBtn}
              >
                <Vector as="feather" name="x" size={20} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            {/* The Tear Line */}
            <View style={localStyles.ticketTearLineContainer}>
               <View style={localStyles.ticketTearLeftHole} />
               <View style={localStyles.ticketTearLine} />
               <View style={localStyles.ticketTearRightHole} />
            </View>

            {/* Receipt Body */}
            <View style={localStyles.ticketBody}>
              <ScrollView showsVerticalScrollIndicator={false} style={localStyles.receiptScroll}>
                
                {/* Information Section */}
                <View style={localStyles.ticketSection}>
                  <Text style={localStyles.ticketSectionTitle}>TRANSFER SPECIFICATIONS</Text>
                  <View style={localStyles.ticketGrid}>
                    {[
                      { label: "Execution Date", value: item.TransactionDate },
                      { label: "Transaction Mode", value: item.TransactionMode },
                      { label: "Transfer Type", value: item.TransferType || "Standard" },
                    ].map((d, i) => (
                      <View key={i} style={localStyles.ticketGridItem}>
                        <Text style={localStyles.ticketGridLabel}>{d.label}</Text>
                        <Text style={localStyles.ticketGridValue}>{d.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* People Section */}
                <View style={localStyles.ticketSection}>
                  <Text style={localStyles.ticketSectionTitle}>PARTIES INVOLVED</Text>
                  <View style={localStyles.ticketGrid}>
                    {(item.TransactionMode === "E-Wallet Debit"
                      ? [
                        { label: "Sender ID", value: item.SenderID },
                        { label: "Sender Name", value: `${item.SenderFirstName} ${item.SenderLastName}` },
                        { label: "Recipient ID", value: item.ReceiverID },
                        { label: "Recipient Name", value: `${item.ReceiverFirstName} ${item.ReceiverLastName}` },
                      ]
                      : [
                        { label: "Sender Name", value: `${item.SenderFirstName} ${item.SenderLastName}` },
                        { label: "Recipient Name", value: `${item.ReceiverFirstName} ${item.ReceiverLastName}` },
                        { label: "Source Country", value: item.SourceCountry },
                        { label: "Payout Country", value: item.DestinationCountry },
                      ]
                    ).map((d, i) => (
                      <View key={i} style={localStyles.ticketGridItem}>
                        <Text style={localStyles.ticketGridLabel}>{d.label}</Text>
                        <Text style={localStyles.ticketGridValue}>{d.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Financial Details Section */}
                <View style={[localStyles.ticketSection, { marginBottom: 30 }]}>
                  <Text style={localStyles.ticketSectionTitle}>FINANCIAL DETAILS</Text>
                  <View style={localStyles.ticketGrid}>
                    {[
                      { label: "Send Amount", value: `${item.Currency}${item.Amount}` },
                      { label: "Exchange Rate", value: `1 ${item.Currency} = 0.00` },
                      { label: "Service Fee", value: `${item.Currency}0.00` },
                    ].map((d, i) => (
                      <View key={i} style={localStyles.ticketGridItem}>
                        <Text style={localStyles.ticketGridLabel}>{d.label}</Text>
                        <Text style={localStyles.ticketGridValue}>{d.value}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={localStyles.ticketTotalBox}>
                    <Text style={localStyles.ticketTotalLabel}>Total Payable</Text>
                    <Text style={localStyles.ticketTotalValue}>{item.Currency}{item.Amount}</Text>
                  </View>
                </View>
              </ScrollView>

              {/* Actions Footer */}
              <View style={localStyles.ticketFooter}>
                <TouchableOpacity onPress={() => setShowViewModal(false)}>
                  <LinearGradient colors={['#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={localStyles.ticketPrimaryBtn}>
                    <Text style={localStyles.ticketPrimaryBtnTxt}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {item.TranStatus === "Success" && !isWalletTxn && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowViewModal(false);
                      handleDownload(item);
                    }}
                    style={localStyles.ticketSecondaryBtn}
                  >
                    <Vector as="feather" name="download" size={16} color="#0ea5e9" />
                    <Text style={localStyles.ticketSecondaryBtnTxt}>Download Receipt</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View >
  );
};

const localStyles = StyleSheet.create({

  ticketStub: {
    padding: 30,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'relative',
  },
  ticketIconBox: {
    marginBottom: 10,
  },
  ticketStatusText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
    marginBottom: 5,
  },
  ticketAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ticketCurrency: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: '#FFF',
    marginRight: 4,
    marginTop: -8,
  },
  ticketAmount: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    color: '#FFF',
    letterSpacing: -1,
  },
  ticketTxnId: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  ticketCloseBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketTearLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  ticketTearLeftHole: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginLeft: -10,
  },
  ticketTearRightHole: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginRight: -10,
  },
  ticketTearLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  ticketBody: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    flexShrink: 1,
  },
  ticketSection: {
    marginBottom: 20,
  },
  ticketSectionTitle: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 10,
  },
  ticketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  ticketGridItem: {
    width: '50%',
    padding: 5,
    marginBottom: 10,
  },
  ticketGridLabel: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: '#64748B',
    marginBottom: 2,
  },
  ticketGridValue: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: '#0F172A',
  },
  ticketTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 15,
    borderRadius: 12,
    marginTop: 5,
  },
  ticketTotalLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#0ea5e9',
  },
  ticketTotalValue: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#0ea5e9',
  },
  ticketFooter: {
    paddingTop: 15,
  },
  ticketPrimaryBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketPrimaryBtnTxt: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: '#FFF',
  },
  ticketSecondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },
  ticketSecondaryBtnTxt: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#0ea5e9',
    marginLeft: 8,
  },

  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: { shadowColor: '#64748b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  statusBar: {
    width: 5,
    height: '100%',
  },
  cardInner: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagShell: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  flagImg: {
    width: '100%',
    height: '100%',
  },
  receiverInfo: {
    marginLeft: 12,
    flex: 1,
  },
  receiverName: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  txnIdText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: '#94a3b8',
    marginTop: 1,
  },
  amountBox: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: SIZES.p16,
    fontFamily: FONTS.monoBold,
    color: '#0ea5e9',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailValue: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: '#64748b',
    marginLeft: 5,
  },
  dateText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#94a3b8',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusTxt: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  actionBtnTxt: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    marginLeft: 6,
  },
  receiptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  receiptStatusTop: {
    height: 12,
    width: '100%',
  },
  receiptInner: {
    padding: 24,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  receiptIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptStatusText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  receiptAmountText: {
    fontSize: 34,
    fontFamily: FONTS.monoBold,
    color: '#1e293b',
    letterSpacing: -1,
  },
  amountCenterBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#64748b',
    marginRight: 4,
  },
  receiptIDText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontFamily: FONTS.bold,
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#0ea5e9',
  },
  dashedLine: {
    height: 1,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    marginVertical: 20,
  },
  receiptScroll: {
    maxHeight: 320,
  },
  receiptSection: {
    marginBottom: 24,
  },
  receiptSectionTitle: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: '#94a3b8',
    letterSpacing: 2,
    marginBottom: 12,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  receiptRowLabel: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#64748b',
  },
  receiptRowValue: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    color: '#1e293b',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  receiptFooter: {
    marginTop: 10,
    gap: 12,
  },
  receiptPrimaryBtn: {
    height: 56,
    backgroundColor: '#0ea5e9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptPrimaryBtnTxt: {
    color: '#fff',
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  receiptSecondaryBtn: {
    height: 52,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  receiptSecondaryBtnTxt: {
    color: '#64748b',
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  receiptCloseBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
});

export default TransactionItem;
