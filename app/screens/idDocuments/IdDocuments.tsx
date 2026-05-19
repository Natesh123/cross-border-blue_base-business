import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from "expo-media-library";
import { SafeAreaView } from "react-native-safe-area-context";
import Container from "../../theme/Container";
import styles from "../../styles";
import Picker from "app/components/customComponents/Picker";
import { GetDocument, GetDocumentList } from "app/http-services";
import { useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import { useIsFocused } from "@react-navigation/native";
import { TDropDown } from "types";
import HomeHeader from "app/components/HomeHeader";
import { SIZES } from "app/constants/Assets";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import { Ionicons } from "@expo/vector-icons";

const getMimeType = (ext: string) => {
  const mimes: { [key: string]: string } = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return mimes[ext.toLowerCase()] || "application/octet-stream";
};

const StatusTimeline = ({ status }: { status: string }) => {
  const isAccepted = status === "ACCEPT";
  const isRejected = status === "REJECT";
  const isProcessing = status === "PROCESS";
  const isCompleted = isAccepted || isRejected;

  const getStepStatus = (index: number): 'completed' | 'active' | 'success' | 'failed' | 'pending' => {
    if (index === 0) return 'completed'; // Submitted is always done
    if (index === 1) {
      if (isCompleted) return 'completed';
      if (isProcessing) return 'active';
      return 'pending';
    }
    if (index === 2) {
      if (isAccepted) return 'success';
      if (isRejected) return 'failed';
      return 'pending';
    }
    return 'pending';
  };

  const steps = [
    { label: 'Submitted', icon: 'cloud-done-outline' },
    { label: 'Processing', icon: 'sync-outline' },
    { label: isRejected ? 'Rejected' : (isAccepted ? 'Accepted' : 'Review'), icon: isAccepted ? 'checkmark-circle-outline' : (isRejected ? 'close-circle-outline' : 'shield-outline') }
  ];

  return (
    <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          const statusColors: Record<string, string> = {
            success: '#10B981',
            failed: '#EF4444',
            active: '#0EA5E9',
            completed: '#10B981',
          };

          return (
            <React.Fragment key={index}>
              <View style={{ alignItems: 'center', width: 80 }}>
                <View style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: stepStatus === 'success' ? '#ECFDF5' : (stepStatus === 'failed' ? '#FEF2F2' : (stepStatus === 'active' ? '#E0F2FE' : '#F9FAFB')),
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: statusColors[stepStatus] || '#E5E7EB',
                }}>
                  {stepStatus === 'active' ? (
                    <ActivityIndicator size="small" color="#0EA5E9" />
                  ) : (
                    <Ionicons
                      name={step.icon as any}
                      size={18}
                      color={statusColors[stepStatus] || '#9CA3AF'}
                    />
                  )}
                </View>
                <Text style={{
                  fontSize: 9,
                  color: stepStatus !== 'pending' ? '#111827' : '#9CA3AF',
                  fontWeight: '800',
                  marginTop: 6,
                  textAlign: 'center'
                }}>{step.label}</Text>
              </View>

              {index < steps.length - 1 && (
                <View style={{
                  height: 2,
                  width: 30,
                  backgroundColor: getStepStatus(index + 1) !== 'pending' ? '#10B981' : '#E5E7EB',
                  marginTop: -16,
                  borderRadius: 2
                }} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const DocumentDetailModal = ({ visible, onClose, doc, remitterId, handleDownload }: { visible: boolean, onClose: () => void, doc: any, remitterId: string, handleDownload: (url: string, type: string) => void }) => {
  if (!doc) return null;

  const detailRow = (label: string, value: string, icon?: string) => (
    <View style={{
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
      marginBottom: 8,
    }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
        {icon && <Ionicons name={icon as any} size={18} color="#0EA5E9" />}
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
        <Text style={{ fontSize: 14, color: '#1F2937', fontWeight: '700', marginTop: 1 }}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', height: '80%' }}>

          <LinearGradient
            colors={["#0EA5E9", "#2563EB"]}
            style={{
              paddingTop: 12,
              paddingBottom: 20,
              paddingHorizontal: 20,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View style={{ width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '900',
                  color: '#fff',
                  fontFamily: Platform.OS === 'ios' ? 'Poppins-Bold' : 'sans-serif-condensed'
                }}>Document Details</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 }}>Review your submission info</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => handleDownload(doc.Document_Name, doc.Document_Type)}
                  activeOpacity={0.8}
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10
                  }}>
                  <Ionicons name="download-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.8}
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <View style={{ flex: 1, padding: 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 25 }}>
              <View style={{
                width: '100%',
                height: 180,
                backgroundColor: '#F9FAFB',
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#F3F4F6',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 4,
              }}>
                <Image
                  source={doc.Document_Name ? { uri: doc.Document_Name } : require("../../assets/pdf.png")}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 4 }}>
                {detailRow("Document Category", doc.Document_Type?.split(",")[0]?.trim(), "layers-outline")}
                {detailRow("Document Type", doc.Document_Type?.split(",")[1]?.trim() || doc.Document_Type, "document-text-outline")}
                {detailRow("Remitter ID", remitterId, "person-outline")}
                {detailRow("Upload Date", doc.UploadedDate ? moment(doc.UploadedDate).format("DD MMM YYYY, HH:mm") : 'N/A', "calendar-outline")}
                <View style={{
                  flexDirection: 'row',
                  paddingVertical: 12,
                  paddingHorizontal: 0,
                  marginBottom: 8,
                }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: doc.Status === 'ACCEPT' ? '#ECFDF5' : (doc.Status === 'REJECT' ? '#FEF2F2' : '#FFFBEB'), justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Ionicons
                      name={doc.Status === 'ACCEPT' ? "shield-checkmark-outline" : (doc.Status === 'REJECT' ? "alert-circle-outline" : "hourglass-outline")}
                      size={18}
                      color={doc.Status === 'ACCEPT' ? '#059669' : (doc.Status === 'REJECT' ? '#DC2626' : '#D97706')}
                    />
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>Current Status</Text>
                    <Text style={{
                      fontSize: 14,
                      color: doc.Status === 'ACCEPT' ? '#059669' : (doc.Status === 'REJECT' ? '#DC2626' : '#D97706'),
                      fontWeight: '800',
                      marginTop: 1
                    }}>
                      {doc.Status === "ACCEPT" ? "Verification Successful" : (doc.Status === "REJECT" ? "Verification Rejected" : (doc.Status === "PROCESS" ? "In Progress" : "Awaiting Review"))}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.9}
              style={{
                backgroundColor: '#0EA5E9',
                paddingVertical: 16,
                borderRadius: 18,
                marginTop: 20,
                alignItems: 'center',
                shadowColor: "#0EA5E9",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 10
              }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const IdDocuments: React.FC = () => {
  const [uploadDocChecked, setUploadDocChecked] = useState<boolean>(false);
  const [frontDocSelected, setFrontDocSelected] = useState<boolean>(false);
  const [backDocSelected, setBackDocSelected] = useState<boolean>(false);
  const [reward, setReward] = useState("");
  const [currency, setCurrency] = useState("£");
  const currentToken = useRecoilValue(ProfileState);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation()

  const [documentType, setDocumentType] = useState<any>({ value: "", error: "" });
  const [documentTypes, setDocumentTypes] = useState<TDropDown[]>([
    {
      dataValue: "",
      displayvalue: "Select Document Type",
      ISDCode: undefined,
      price: undefined,
      description: undefined,
      flag: undefined,
      name: "",
      Alpha_2_Code: ""
    },
  ]);

  // keep ID and Non-ID separately
  const [idDocuments, setIdDocuments] = useState<any[]>([]);
  const [nonIdDocuments, setNonIdDocuments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ID" | "Non-ID">("ID");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleDownload = async (url: string, docType: string) => {
    try {
      if (!url) {
        Alert.alert("Error", "Download link not available for this document.");
        return;
      }
      setLoading(true);

      // Extract extension from URL
      const urlParts = url.split('.');
      const extension = (urlParts.length > 1 ? urlParts.pop()?.split('?')[0]?.toLowerCase() : 'pdf') || 'pdf';

      // Clean filename from docType
      const cleanName = docType.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
      const fileName = `${cleanName}.${extension}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const downloadRes = await FileSystem.downloadAsync(url, fileUri);

      if (downloadRes.status === 200) {
        if (Platform.OS === 'android') {
          // 1. If it's an image, save to gallery
          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
          if (imageExtensions.includes(extension)) {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
              try {
                await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
                Alert.alert("Success", "Document saved to gallery.");
                return;
              } catch (err) {
                console.log("MediaLibrary error, falling back", err);
              }
            }
          }

          // 2. For documents or if gallery failed, use StorageAccessFramework to save to a user chosen folder
          try {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, { encoding: FileSystem.EncodingType.Base64 });
              const mimeType = getMimeType(extension);

              const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                fileName,
                mimeType
              );

              await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });
              Alert.alert("Success", "Document downloaded successfully!");
            } else {
              // Fallback to sharing if permission denied
              await Sharing.shareAsync(downloadRes.uri);
            }
          } catch (safError) {
            console.error("SAF Error:", safError);
            await Sharing.shareAsync(downloadRes.uri);
          }
        } else {
          // iOS: Standard sharing sheet (includes "Save to Files")
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadRes.uri);
          } else {
            Alert.alert("Success", "File downloaded successfully!");
          }
        }
      } else {
        Alert.alert("Error", "Failed to download the document.");
      }
    } catch (error) {
      console.error("Download Error:", error);
      Alert.alert("Error", "Could not download the file. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchSubmittedDocuments(currentToken.tokenId, currentToken.remitterId);
      fetchDocumentList(currentToken.tokenId, currentToken.remitterId);
    }
  }, [isFocused]);

  const canUpload = uploadDocChecked && !!documentType.value && frontDocSelected;

  /** ID DOC TYPES */
  const ID_DOC_TYPES = [
    "aadhaar",
    "passport",
    "driving license",
    "driving licence",
    "pan",
    "voter id",
  ];

  /** Fetch submitted documents */
  const fetchSubmittedDocuments = async (tokenId: string, remitterId: string) => {
    try {
      setLoading(true);
      const res = await GetDocument(tokenId);

      if (res?.status === 200 && res.data.StatusCode === "ER0000") {
        const docs = Array.isArray(res.data.Document) ? res.data.Document : [];

        // split docs into ID and Non-ID based on prefix before comma
        const idDocs = docs.filter(
          (d: any) => {
            const typePrefix = d?.Document_Type?.split(",")[0]?.trim()?.toLowerCase();
            return typePrefix === "id-document";
          }
        );

        const nonIdDocs = docs.filter(
          (d: any) => {
            const typePrefix = d?.Document_Type?.split(",")[0]?.trim()?.toLowerCase();
            return typePrefix === "non-id-document";
          }
        );

        setIdDocuments(idDocs);
        setNonIdDocuments(nonIdDocs);
      } else {
        setIdDocuments([]);
        setNonIdDocuments([]);
      }
    } catch (error) {
      console.error("Fetch Submitted Documents Error:", error);
      setIdDocuments([]);
      setNonIdDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  /** Fetch document types for dropdown */
  const fetchDocumentList = async (tokenId: string, remitterId: string) => {
    try {
      setLoading(true);
      const res = await GetDocumentList(tokenId);

      if (res.status === 200 && res.data.StatusCode === "ER0000") {
        const documents = res.data.Document.map((data: any) => ({
          dataValue: data.Document_Name,
          displayvalue: data.Document_Type,
        }));

        const docsWithPlaceholder = [
          {
            dataValue: "",
            displayvalue: "Select Document Type",
            ISDCode: undefined,
          },
          ...documents,
        ];

        setDocumentTypes(docsWithPlaceholder);
        setDocumentType({ value: "", error: "" });
      } else {
        setDocumentTypes([
          {
            dataValue: "",
            displayvalue: "Select Document Type",
            ISDCode: undefined,
            price: undefined,
            description: undefined,
            flag: undefined,
            name: "",
            Alpha_2_Code: ""
          },
        ]);
        setDocumentType({ value: "", error: "" });
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]}>
      <HomeHeader
        name={currentToken.firstName}
        currency={currency}
        reward={reward}
      />
      <Container>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 30,
            paddingHorizontal: 25,
            marginBottom: 10,
          }}
        >
          <View>
            <Text style={{
              fontSize: 20,
              fontWeight: "900",
              color: "#111827",
              fontFamily: Platform.OS === 'ios' ? 'Poppins-Bold' : 'sans-serif-condensed'
            }}>My Documents</Text>
            <View style={{ height: 3.5, width: 30, backgroundColor: "#0EA5E9", marginTop: 5, borderRadius: 2 }} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("UploadnewDocuments")}
            activeOpacity={0.7}
            style={{
              backgroundColor: "#0EA5E9",
              width: 50,
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: "#0EA5E9",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>


        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 25,
            marginTop: 20,
            backgroundColor: "#F1F5F9",
            borderRadius: 22,
            padding: 6,
            shadowColor: "#0EA5E9",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 10,
            elevation: 4
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab("ID")}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: "center",
              backgroundColor: activeTab === "ID" ? "#0EA5E9" : "transparent",
              borderRadius: 18,
              shadowColor: activeTab === "ID" ? "#0EA5E9" : "transparent",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: activeTab === "ID" ? 10 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: activeTab === "ID" ? "900" : "600",
                color: activeTab === "ID" ? "#FFFFFF" : "#64748B",
                letterSpacing: 0.5
              }}
            >
              ID Documents ({idDocuments.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("Non-ID")}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: "center",
              backgroundColor: activeTab === "Non-ID" ? "#0EA5E9" : "transparent",
              borderRadius: 18,
              shadowColor: activeTab === "Non-ID" ? "#0EA5E9" : "transparent",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: activeTab === "Non-ID" ? 10 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: activeTab === "Non-ID" ? "900" : "600",
                color: activeTab === "Non-ID" ? "#FFFFFF" : "#64748B",
                letterSpacing: 0.5
              }}
            >
              Non-ID ({nonIdDocuments.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{
            width: "100%",
            backgroundColor: "#F8FAFC",
            paddingHorizontal: 20,
            paddingTop: 15,
            marginBottom: 70,
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {activeTab === "ID" ? (
            <View style={{ paddingBottom: 30 }}>
              {idDocuments.length > 0 ? (
                idDocuments.map((doc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.98}
                    onPress={() => {
                      setSelectedDoc(doc);
                      setShowDetailModal(true);
                    }}
                    style={{
                      backgroundColor: "#FFFFFF",
                      marginBottom: 20,
                      borderRadius: 24,
                      shadowColor: "#0EA5E9",
                      shadowOpacity: 0.1,
                      shadowOffset: { width: 0, height: 10 },
                      shadowRadius: 20,
                      elevation: 8,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: '#F1F5F9'
                    }}
                  >
                    {/* Top Accent Bar */}
                    <View style={{ height: 4, backgroundColor: '#0EA5E9' }} />

                    <View style={{ padding: 20 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                        <View style={{
                          backgroundColor: doc.Status === 'ACCEPT' ? '#ECFDF5' : (doc.Status === 'REJECT' ? '#FEF2F2' : '#EFF6FF'),
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 9,
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                          <Ionicons
                            name={doc.Status === 'ACCEPT' ? "checkmark-circle" : (doc.Status === 'REJECT' ? "close-circle" : "time")}
                            size={12}
                            color={doc.Status === 'ACCEPT' ? '#10B981' : (doc.Status === 'REJECT' ? '#EF4444' : '#0EA5E9')}
                            style={{ marginRight: 5 }}
                          />
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '900',
                            color: doc.Status === 'ACCEPT' ? '#065F46' : (doc.Status === 'REJECT' ? '#991B1B' : '#1E40AF'),
                            textTransform: 'uppercase'
                          }}>
                            {doc.Status === "ACCEPT" ? "Verified" : (doc.Status === "REJECT" ? "Rejected" : "In Review")}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700' }}>
                          {doc.UploadedDate ? moment(doc.UploadedDate).format("DD MMM YYYY") : moment().format("DD MMM YYYY")}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={{
                            width: 100,
                            height: 70,
                            backgroundColor: "#F8FAFC",
                            borderRadius: 16,
                            justifyContent: "center",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#E2E8F0",
                            overflow: 'hidden',
                          }}
                        >
                          <Image
                            source={doc.Document_Name ? { uri: doc.Document_Name } : require("../../assets/pdf.png")}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        </View>

                        <View style={{ flex: 1, paddingLeft: 18 }}>
                          <Text
                            style={{
                              color: "#1E293B",
                              fontWeight: "900",
                              fontSize: 14,
                              lineHeight: 18,
                              marginBottom: 4
                            }}
                          >
                            {doc.Document_Type?.includes(",") ? doc.Document_Type.split(",")[1].trim() : doc.Document_Type}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedDoc(doc);
                              setShowDetailModal(true);
                            }}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                          >
                            <Text style={{ fontSize: 12, color: '#0EA5E9', fontWeight: '800' }}>View Details</Text>
                            <Ionicons name="arrow-forward" size={13} color="#0EA5E9" style={{ marginLeft: 3 }} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{
                        marginTop: 20,
                        paddingTop: 15,
                        borderTopWidth: 1,
                        borderTopColor: '#F1F5F9'
                      }}>
                        <StatusTimeline status={doc.Status} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 40 }}>
                  <View style={{
                    width: 100, height: 100, backgroundColor: '#F3F4F6',
                    borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20
                  }}>
                    <Ionicons name="documents-outline" size={50} color="#D1D5DB" />
                  </View>
                  <Text style={{ color: "#111827", fontSize: 18, fontWeight: "900", marginBottom: 10 }}>Empty Vault</Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 13, textAlign: 'center', lineHeight: 22, fontWeight: '500' }}>
                    Your document vault is empty. Upload your first document to start the verification process.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{ paddingBottom: 30 }}>
              {nonIdDocuments.length > 0 ? (
                nonIdDocuments.map((doc, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.98}
                    onPress={() => {
                      setSelectedDoc(doc);
                      setShowDetailModal(true);
                    }}
                    style={{
                      backgroundColor: "#FFFFFF",
                      marginBottom: 20,
                      borderRadius: 24,
                      shadowColor: "#0EA5E9",
                      shadowOpacity: 0.1,
                      shadowOffset: { width: 0, height: 10 },
                      shadowRadius: 20,
                      elevation: 8,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: '#F1F5F9'
                    }}
                  >
                    {/* Top Accent Bar */}
                    <View style={{ height: 4, backgroundColor: '#0EA5E9' }} />

                    <View style={{ padding: 20 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                        <View style={{
                          backgroundColor: doc.Status === 'ACCEPT' ? '#ECFDF5' : (doc.Status === 'REJECT' ? '#FEF2F2' : '#EFF6FF'),
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 10,
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}>
                          <Ionicons
                            name={doc.Status === 'ACCEPT' ? "checkmark-circle" : (doc.Status === 'REJECT' ? "close-circle" : "time")}
                            size={14}
                            color={doc.Status === 'ACCEPT' ? '#10B981' : (doc.Status === 'REJECT' ? '#EF4444' : '#0EA5E9')}
                            style={{ marginRight: 6 }}
                          />
                          <Text style={{
                            fontSize: 11,
                            fontWeight: '900',
                            color: doc.Status === 'ACCEPT' ? '#065F46' : (doc.Status === 'REJECT' ? '#991B1B' : '#1E40AF'),
                            textTransform: 'uppercase'
                          }}>
                            {doc.Status === "ACCEPT" ? "Verified" : (doc.Status === "REJECT" ? "Rejected" : "In Review")}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '700' }}>
                          {doc.UploadedDate ? moment(doc.UploadedDate).format("DD MMM YYYY") : moment().format("DD MMM YYYY")}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={{
                            width: 100,
                            height: 70,
                            backgroundColor: "#F8FAFC",
                            borderRadius: 16,
                            justifyContent: "center",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#E2E8F0",
                            overflow: 'hidden',
                          }}
                        >
                          <Image
                            source={doc.Document_Name ? { uri: doc.Document_Name } : require("../../assets/pdf.png")}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        </View>

                        <View style={{ flex: 1, paddingLeft: 18 }}>
                          <Text
                            style={{
                              color: "#1E293B",
                              fontWeight: "900",
                              fontSize: 14,
                              lineHeight: 18,
                              marginBottom: 4
                            }}
                          >
                            {doc.Document_Type?.includes(",") ? doc.Document_Type.split(",")[1].trim() : doc.Document_Type}
                          </Text>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedDoc(doc);
                              setShowDetailModal(true);
                            }}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                          >
                            <Text style={{ fontSize: 12, color: '#0EA5E9', fontWeight: '800' }}>View Details</Text>
                            <Ionicons name="arrow-forward" size={13} color="#0EA5E9" style={{ marginLeft: 3 }} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{
                        marginTop: 20,
                        paddingTop: 15,
                        borderTopWidth: 1,
                        borderTopColor: '#F1F5F9'
                      }}>
                        <StatusTimeline status={doc.Status} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: 40 }}>
                  <View style={{
                    width: 100, height: 100, backgroundColor: '#F3F4F6',
                    borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20
                  }}>
                    <Ionicons name="layers-outline" size={50} color="#D1D5DB" />
                  </View>
                  <Text style={{ color: "#111827", fontSize: 20, fontWeight: "900", marginBottom: 10 }}>No Records</Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 15, textAlign: 'center', lineHeight: 22, fontWeight: '500' }}>
                    You have no supporting documents submitted for review.
                  </Text>
                </View>
              )}
            </View>
          )}

          <DocumentDetailModal
            visible={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            doc={selectedDoc}
            remitterId={currentToken.remitterId}
            handleDownload={handleDownload}
          />
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

export default IdDocuments;
