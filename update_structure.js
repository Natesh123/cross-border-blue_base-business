const fs = require('fs');

const jsxReplacement = `      {/* Solid Blue Corporate Header */}
      <View style={localStyles.blueHeaderBlock}>
        <View style={localStyles.header}>
          <TouchableOpacity style={localStyles.backButton} onPress={() => navigation.goBack()}>
            <Vector as="feather" name="chevron-left" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={localStyles.headerTitle}>Transfer Funds</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={localStyles.headerBalanceContent}>
          <Text style={localStyles.balanceLabel}>AVAILABLE BALANCE</Text>
          <View style={localStyles.amountContainer}>
            <Text style={localStyles.currencySymbol}>{currency}</Text>
            <Text style={localStyles.mainAmount}>{integerPart || "0"}</Text>
            <Text style={localStyles.decimalAmount}>.{decimalPart}</Text>
          </View>
          <View style={localStyles.eliteBadgePill}>
            <Vector as="materialicons" name="verified-user" size={14} color="#FFF" />
            <Text style={localStyles.eliteBadgeTxt}>SECURE ACCOUNT</Text>
          </View>
        </View>
      </View>

      <Container>
        <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 10, marginTop: -50 }} showsVerticalScrollIndicator={false}>
          {!showTransferForm ? (
            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={localStyles.overlappingCard}>
              <View style={localStyles.iconBox}>
                <Vector as="feather" name="send" size={28} color="#1E3A8A" />
              </View>
              <Text style={localStyles.infoTitle}>Instant Transfer</Text>
              <Text style={localStyles.infoDesc}>
                Send money securely and instantly to registered beneficiaries.
              </Text>
              
              <View style={localStyles.timelineWrapper}>
                {[
                  { icon: "user", title: "Beneficiary ID", desc: "Enter receiver's ID" },
                  { icon: "dollar-sign", title: "Transfer Amount", desc: "Specify value" },
                  { icon: "shield", title: "Authenticate", desc: "Secure confirmation" }
                ].map((step, index) => (
                  <View key={index} style={localStyles.timelineNode}>
                    <View style={localStyles.nodeIconCol}>
                      <View style={localStyles.nodeIconBox}>
                        <Vector as="feather" name={step.icon} size={14} color="#1E3A8A" />
                      </View>
                      {index < 2 && <View style={localStyles.nodeConnector} />}
                    </View>
                    <View style={localStyles.nodeContent}>
                      <Text style={localStyles.nodeTitle}>{step.title}</Text>
                      <Text style={localStyles.nodeDesc}>{step.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={localStyles.primaryBtn} onPress={() => setShowTransferForm(true)} activeOpacity={0.9}>
                <Text style={localStyles.primaryBtnText}>Start New Transfer</Text>
                <Vector as="feather" name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={localStyles.overlappingCard}>
              <View style={localStyles.formHeader}>
                <Text style={localStyles.formTitle}>Transfer Details</Text>
                <TouchableOpacity onPress={() => setShowTransferForm(false)} style={localStyles.cancelBtn}>
                  <Vector as="feather" name="x" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={localStyles.amountInputArea}>
                <Text style={localStyles.amountHeroLabel}>AMOUNT TO SEND</Text>
                <View style={localStyles.amountInputWrapper}>
                  <Text style={localStyles.amountHeroCurrency}>{currency}</Text>
                  <TextInput
                    style={localStyles.amountHeroInput}
                    placeholder="0.00"
                    placeholderTextColor="#CBD5E1"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(val) => setAmount(val.replace(/[^0-9.]/g, ""))}
                  />
                </View>
                <View style={localStyles.amountUnderline} />
              </View>

              <View style={localStyles.inputGroup}>
                <Text style={localStyles.inputLabel}>RECEIVER ID</Text>
                <View style={[localStyles.inputWrapper, receiverId ? localStyles.inputWrapperActive : null]}>
                  <Vector as="feather" name="user" size={18} color={receiverId ? "#1E3A8A" : "#94A3B8"} style={localStyles.inputIcon} />
                  <TextInput
                    style={localStyles.textInput}
                    placeholder="e.g. KM00000001"
                    placeholderTextColor="#94a3b8"
                    value={receiverId}
                    onChangeText={(val) => setReceiverId(val.replace(/[^a-zA-Z0-9]/g, ""))}
                  />
                </View>
                {receiverId ? (
                  <Animated.View entering={FadeInLeft} style={localStyles.verifiedRow}>
                    <Vector as="feather" name="check-circle" size={14} color="#10B981" />
                    <Text style={localStyles.receiverHint}>Ready to verify</Text>
                  </Animated.View>
                ) : null}
              </View>

              <View style={localStyles.inputGroup}>
                <Text style={localStyles.inputLabel}>VERIFICATION EMAIL</Text>
                <View style={[localStyles.inputWrapper, email ? localStyles.inputWrapperActive : null]}>
                  <Vector as="feather" name="mail" size={18} color={email ? "#1E3A8A" : "#94A3B8"} style={localStyles.inputIcon} />
                  <TextInput
                    style={localStyles.textInput}
                    placeholder="name@email.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={localStyles.warningBox}>
                <Vector as="feather" name="shield" size={16} color="#1E3A8A" />
                <Text style={localStyles.warningText}>End-to-end encrypted transfer.</Text>
              </View>

              <TouchableOpacity
                style={[localStyles.primaryBtn, (!receiverId || !amount || !email || submitting) && localStyles.primaryBtnDisabled]}
                disabled={!receiverId || !amount || !email || submitting}
                onPress={handleConfirmTransfer}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={localStyles.primaryBtnText}>Confirm Transfer</Text>
                    <Vector as="feather" name="chevron-right" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          )}`;

const stylesReplacement = `const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Clean light blue-gray background
  },
  blueHeaderBlock: {
    backgroundColor: '#1E3A8A', // Deep corporate blue
    paddingBottom: 70, // Extra padding for overlapping card
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: Platform.OS === 'ios' ? 40 : 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontFamily: FONTS.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerBalanceContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: RFValue(10),
    fontFamily: FONTS.bold,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currencySymbol: {
    color: '#FFF',
    fontSize: RFValue(20),
    fontFamily: FONTS.bold,
    marginRight: 6,
  },
  mainAmount: {
    color: '#FFF',
    fontSize: RFValue(36),
    fontFamily: FONTS.bold,
    letterSpacing: -1,
  },
  decimalAmount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: RFValue(16),
    fontFamily: FONTS.medium,
  },
  eliteBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  eliteBadgeTxt: {
    color: '#FFF',
    fontSize: RFValue(9),
    fontFamily: FONTS.bold,
    letterSpacing: 1,
  },
  overlappingCard: {
    marginHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 25,
    ...Platform.select({
      ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 15 },
      android: { elevation: 5 }
    }),
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: RFValue(18),
    fontFamily: FONTS.bold,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: RFValue(11),
    fontFamily: FONTS.medium,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: RFValue(18),
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  timelineWrapper: {
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  timelineNode: {
    flexDirection: 'row',
    minHeight: 65,
  },
  nodeIconCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 15,
  },
  nodeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  nodeContent: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 4,
  },
  nodeTitle: {
    fontSize: RFValue(12),
    fontFamily: FONTS.bold,
    color: '#0F172A',
    marginBottom: 2,
  },
  nodeDesc: {
    fontSize: RFValue(10),
    fontFamily: FONTS.medium,
    color: '#64748B',
  },
  primaryBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10 },
      android: { elevation: 4 }
    }),
  },
  primaryBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: RFValue(14),
    fontFamily: FONTS.bold,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  formTitle: {
    fontSize: RFValue(16),
    fontFamily: FONTS.bold,
    color: '#0F172A',
  },
  cancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountInputArea: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 15,
  },
  amountHeroLabel: {
    fontSize: RFValue(9),
    fontFamily: FONTS.bold,
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 10,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountHeroCurrency: {
    fontSize: RFValue(20),
    fontFamily: FONTS.bold,
    color: '#0F172A',
    marginRight: 6,
    marginTop: -4,
  },
  amountHeroInput: {
    fontSize: RFValue(32),
    fontFamily: FONTS.bold,
    color: '#0F172A',
    minWidth: 100,
    textAlign: 'center',
    letterSpacing: -1,
    outlineStyle: 'none',
  },
  amountUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#1E3A8A',
    borderRadius: 2,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: RFValue(9),
    fontFamily: FONTS.bold,
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  inputWrapperActive: {
    borderColor: '#1E3A8A',
    backgroundColor: '#FFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
    gap: 4,
  },
  receiverHint: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: '#10B981',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 25,
  },
  warningText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#1E3A8A',
    flex: 1,
  },
});`;

const filePath = '/Users/balaji/Documents/Natesh-Kashminds/Mobile App (Android)/cross-border-blue_base-business/app/screens/myWalletTransfer/MyWalletTransfer.tsx';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

const jsxStartMarker = '      {/* Immersive Animated Background */}';
const jsxEndMarker = '      {/* Set TPIN Modal */}';
const stylesStartMarker = 'const localStyles = StyleSheet.create({';
const stylesEndMarker = 'const tpinModalStyles = StyleSheet.create({';

let jsxStartIndex = -1;
let jsxEndIndex = -1;
let stylesStartIndex = -1;
let stylesEndIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(jsxStartMarker)) jsxStartIndex = i;
  if (lines[i].includes(jsxEndMarker)) jsxEndIndex = i;
  if (lines[i].includes(stylesStartMarker)) stylesStartIndex = i;
  if (lines[i].includes(stylesEndMarker)) stylesEndIndex = i;
}

if (jsxStartIndex !== -1 && jsxEndIndex !== -1 && stylesStartIndex !== -1 && stylesEndIndex !== -1) {
  // Replace styles first (since they are further down, indices won't be messed up for jsx)
  lines.splice(stylesStartIndex, stylesEndIndex - stylesStartIndex, stylesReplacement);
  
  // Replace JSX
  // We need to keep the closing </ScrollView> and </Container> that are before jsxEndMarker
  lines.splice(jsxStartIndex, jsxEndIndex - jsxStartIndex - 2, jsxReplacement); // -2 to keep container close

  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('Update applied successfully');
} else {
  console.error('Markers not found', {jsxStartIndex, jsxEndIndex, stylesStartIndex, stylesEndIndex});
}
