import { FONTS, SHADOWS, SIZES } from "../constants/Assets";
import { Dimensions, StyleSheet, Platform } from "react-native";
import { theme } from '../core/theme';
const styles = StyleSheet.create({



  homeHeader: {
    backgroundColor: "#fff",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    ...SHADOWS.shadow,
  },


  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 45,
  },

  searchInput: {
    flex: 1,
    fontSize: SIZES.h3,
    fontFamily: FONTS.regular,
    color: "#333",
  },

  addButtonRound: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0EA5E9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: SIZES.h3,
    fontFamily: FONTS.semibold,
    fontWeight: "600",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.regular,
    fontWeight: "600",
    color: "#000",
  },
  header: {
    fontSize: SIZES.h2,
    fontFamily: FONTS.semibold,
    color: theme.colors.color,
    paddingVertical: 5,
    marginBottom: 5,
    fontWeight: '600'
  },


  menuText: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.regular,
    color: theme.colors.black50,
  },
  headers: {
    fontSize: SIZES.font,
    fontFamily: FONTS.bold,
    color: theme.colors.darkgray,
    marginBottom: 5,
    fontWeight: 'bold',
    marginLeft: "30%"
  },
  recipient: {
    marginLeft: 20,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: theme.colors.darkgray,
    fontFamily: FONTS.regular,
    paddingVertical: 5,
    marginBottom: 5
  },
  recipients: {
    marginLeft: 5,
    fontSize: SIZES.h3,
    color: theme.colors.darkgray,
    fontFamily: FONTS.regular,
    paddingVertical: 5,
    marginTop: -25,
    flexWrap: 'wrap',
    width: '100%',
  },
  headerDescription: {
    fontSize: SIZES.p16,
    color: theme.colors.black50,
    fontFamily: FONTS.medium,
    paddingVertical: 14,
  },
  container: {

    flex: 1,
    // backgroundColor:'#fbfdff'
  },

  scrollview: {
    width: "100%", paddingBottom: 60
  },
  inputContainer: {
    marginBottom: 15,
    flexDirection: 'column',
  },
  inputLabel: {
    color: theme.colors.color,
    fontSize: SIZES.h3,
    marginVertical: 5,
    fontFamily: FONTS.medium
  },
  inputControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  error: {
    fontSize: SIZES.font,
    fontFamily: FONTS.regular,
    color: theme.colors.error,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  startButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: theme.colors.secondary,
    borderRadius: 30,
    width: "100%",
    padding: 10,
    paddingHorizontal: 25,
  },
  startIcon: {
    height: 35,
    width: 35,
    borderRadius: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.tertiary,
  },
  primaryColor: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
  },
  secondaryColor: {
    backgroundColor: theme.colors.secondary,
    color: theme.colors.primary,
  },
  tertiaryColor: {
    backgroundColor: theme.colors.tertiary,
    color: theme.colors.primary,
  },
  cardWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.elevation0,
  },
  largeButton: { width: "100%", height: 55, paddingVertical: 8, borderRadius: 10 },
  bottomButton: { width: "100%", padding: 10, position: "absolute", bottom: 0, left: 10 },
  leadingIcon: {
    width: 40,
    height: 40,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -SIZES.p20,
    ...SHADOWS.elevation0,
  },
  cardMainWrapper: Platform.select({
    ios: {
      backgroundColor: theme.colors.secondary,
      borderRadius: SIZES.p20,
      shadowColor: theme.colors.color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.05,
      shadowRadius: 24,
      padding: 20,
    },
    android: {
      backgroundColor: theme.colors.secondary,
      borderRadius: SIZES.p20,
      padding: 20,
      elevation: 1,
    },
    web: {
      backgroundColor: theme.colors.secondary,
      borderRadius: SIZES.p20,
      padding: 20,
      boxShadow: `0px 0px 24px ${theme.colors.color}0D`, // 0D is ~0.05 opacity
    }
  }) as any,
  gray10ButtonView: {
    backgroundColor: theme.colors.gray10,
    marginVertical: SIZES.p20,
    marginHorizontal: SIZES.p20,
    padding: SIZES.p6,
    borderRadius: SIZES.small,
  },
  whiteButtonView: {
    backgroundColor: theme.colors.white,
    marginVertical: SIZES.p20,
    marginHorizontal: SIZES.p20,
    padding: SIZES.p6,
    borderRadius: SIZES.small,
  },
  primaryButtonView: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: SIZES.p20,
    padding: SIZES.p15,
    borderRadius: SIZES.small,
  },
  primaryButtonText: {
    textAlign: "center",
    color: theme.colors.white,
    fontFamily: FONTS.semibold,
    fontSize: SIZES.h2,
  },
  primaryLinkTextView: {
    backgroundColor: theme.colors.primary,
  },
  primaryLinkText: {
    color: theme.colors.link,
    fontFamily: FONTS.regular,
    fontSize: SIZES.h3,
    paddingRight: SIZES.p6,
  },
  headerStyle: {
    backgroundColor: theme.colors.primary,
  },
  selectorStyle: { borderColor: theme.colors.gray10 },
  dropdownContainerStyle: {
    width: '100%',
    marginTop: 5,
    borderColor: theme.colors.gray10,
  },
  spacing: {
    margin: 10
  },
  spacing_big: {
    margin: 30
  },
  label: {
    fontWeight: '300',
    fontFamily: FONTS.regular,
    paddingLeft: 5,
    fontSize: SIZES.p18,
    color: theme.colors.black50,
  },
  input: {
    height: 50,
    width: '100%',
    padding: 12,
    fontSize: SIZES.h3,
    fontFamily: FONTS.regular,
    outlineStyle: 'none'
  } as any,
  imagecontainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image_logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',

  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 7,
    elevation: 5,
    marginTop: 100,
  },
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  rightSide: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },

  link: {
    fontWeight: 'bold',
    fontFamily: FONTS.regular,
    color: theme.colors.primary,
  },
  sideMenuProfileIcon: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    alignSelf: 'center',
    resizeMode: 'contain'
  },
  iconStyle: {
    width: 15,
    height: 15,
    marginHorizontal: 5,
  },
  customItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navBar: {
    width: '100%',
    height: 70,
    backgroundColor: '#0D0D0D',
    alignContent: 'center',
    justifyContent: 'center'
  },
  navBarTitle: {
    color: 'white',
    fontSize: SIZES.h2,
    fontFamily: FONTS.bold,
    fontWeight: "bold",
    alignSelf: 'center'
  },
  scrollViewContainerStyle: {
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletBalanceAmount: {
    color: theme.colors.white,
    fontSize: SIZES.h3,
    fontWeight: "bold",
    paddingHorizontal: SIZES.p15,
    textAlign: "center",
    fontFamily: FONTS.monoBold,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
  },
  walletBalance: {
    color: theme.colors.primary,
    fontSize: SIZES.h3,
    fontWeight: "bold",
    paddingHorizontal: SIZES.p15,
    textAlign: "center",
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: FONTS.monoBold,
  },
  walletBalanceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    backgroundColor: theme.colors.white,
    padding: 10,
    borderRadius: 10
  },
  pickerItemsContainer: {
    position: 'absolute',
    top: 100,
    left: 50,
    right: 50,
  },
  picker: {
    height: 50,
    width: 200,
    marginVertical: 12,
  },
});

export default styles;
