import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { ColorSchemeName, TouchableOpacity, View } from "react-native";
import { Text } from "react-native";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import Home from "../screens/home/Home";
import Onboarding from "../screens/onboarding/Onboarding";
import Profile from "../screens/profile/Profile";
import { RootStackParamList, RootTabParamList } from "../../types";
import LinkingConfiguration from "./LinkingConfiguration";
import Vector from "app/assets/vectors";
import { FONTS, SHADOWS, SIZES } from "../constants/Assets";
import { COLOR_SCHEME } from "../constants/Colors";
import Login from "../screens/authentication/Login";
import Recipients from "../screens/recipients/Recipients";
import ForgotPassword from "../screens/authentication/ForgotPassword";
import SendMoney from "../screens/sendMoney/SendMoney";
import Transactions from "../screens/transactions/Transactions";
import TabShape from "./components/curve";
import ToastConfig from "app/components/ToastConfig";
import BottomTabNavigator from "./bottomTabNavigator";
import Signup from "app/screens/authentication/Signup";
import ValidateRegistration from "app/screens/authentication/ValidateRegistration";
import PostRegistration from "app/screens/postRegistration/PostRegistration";
import IdDocuments from "app/screens/idDocuments/IdDocuments";
import MyWalletTransfer from "app/screens/myWalletTransfer/MyWalletTransfer";
import Notification from "app/screens/notification/Notification";
import CustomDrawer from "app/components/customComponents/Drawer";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AddRecipients from "app/shared/components/recipients/AddRecipients";
import AddRecipient from "app/shared/components/recipients/AddRecipient";
import Recipient from 'app/screens/sendMoney/components/Recipient';
import YourProfile from "app/shared/components/recipients/YourProfile";
import Review from "app/shared/components/recipients/Review";
import FinalStage from "app/shared/components/recipients/FinalStage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import Toast, { ToastConfigParams } from 'react-native-toast-message';
import UploadnewDocuments from "app/screens/idDocuments/UploadnewDocuments";
import ReferandEarn from "app/screens/referandearn/ReferandEarn";
import withdraw from "app/screens/myWalletTransfer/withdraw";
import AddFund from "app/screens/myWalletTransfer/AddFund";
import AirtimeTopup from "app/screens/airtimeTopup/airtimeTopup";
import AirtimeTopupList from "app/screens/airtimeTopup/airtimeTopuplist";
import AirtimeTopupForm from "app/screens/airtimeTopup/airtimeTopupForm";
import AirtimeTopupFinal from "app/screens/airtimeTopup/airtimeTopupPay";
import AirtimeTopupPay from "app/screens/airtimeTopup/airtimeTopupPay";
import QuickAddWishlist from "app/screens/quickAddWashlist/quickAddWatchlist";
import QuickAddWatchlist from "app/screens/quickAddWashlist/quickAddWatchlist";
import QuickAddWatchlistForm from "app/screens/quickAddWashlist/quickAddWatchlistForm";
import Ionicons from "react-native-vector-icons/Ionicons";
import Faq from "app/screens/faq/Faq";


export default function Navigation({

  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer linking={LinkingConfiguration} theme={DefaultTheme}>
        <RootNavigator />
      </NavigationContainer>

      {/* Global Toast */}


    </View>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [initialRoute, setInitialRoute] = React.useState<keyof RootStackParamList | null>(null);

  React.useEffect(() => {
    const loadInitialRoute = async () => {
      try {
        const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
        console.log("hasOnboarded:", hasOnboarded);

        if (hasOnboarded === "true") {
          // If onboarding already done, show Login
          setInitialRoute("Login");
        } else {
          // If onboarding NOT done, always show Onboarding first
          setInitialRoute("Onboarding");
        }
      } catch (error) {
        console.error("Failed to read async storage:", error);
        setInitialRoute("Onboarding");
      }
    };

    loadInitialRoute();
  }, []);



  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={Onboarding}
        options={{
          animation: 'slide_from_right',
          title: 'Onboarding',
          headerShown: false
        }} />
      <Stack.Screen
        name="Root"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="App" component={DrawerNavigator}
        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Login" component={Login}
        options={{
          animation: 'slide_from_right',
          title: 'Login',
          headerShown: false
        }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword}
        options={{
          animation: 'slide_from_right',
          title: 'ForgotPassword',
          headerShown: false
        }} />
      <Stack.Screen name="Signup" component={Signup}
        options={{
          animation: 'slide_from_right',
          title: 'Sign up',
          headerShown: false
        }} />
      <Stack.Screen name="ValidateRegistration" component={ValidateRegistration}
        options={{
          animation: 'slide_from_right',
          title: 'Validate registration',
          headerShown: false
        }} />
      <Stack.Screen name="SendMoney" component={SendMoney}
        options={{
          animation: 'slide_from_right',
          title: 'Send money',
          headerShown: false
        }} />
      <Stack.Screen name="PostRegistration" component={PostRegistration}
        options={{
          animation: 'slide_from_right',
          title: 'Post registration',
          headerShown: false
        }} />
      <Stack.Screen name="AddRecipients" component={AddRecipients}
        options={{
          animation: 'slide_from_right',
          title: 'Add recipients',
          headerShown: false
        }} />
      <Stack.Screen name="AddRecipient" component={AddRecipient}
        options={{
          animation: 'slide_from_right',
          title: 'Add recipients',
          headerShown: false
        }} />
      <Stack.Screen name="YourProfile" component={YourProfile}
        options={{
          animation: 'slide_from_right',
          title: 'Your Profile',
          headerShown: false
        }} />
      <Stack.Screen name="Review" component={Review}
        options={{
          animation: 'slide_from_right',
          title: 'Review',
          headerShown: false
        }} />
      <Stack.Screen name="FinalStage" component={FinalStage}
        options={{
          animation: 'slide_from_right',
          title: 'Final Stage',
          headerShown: false
        }} />

      <Stack.Screen name="Recipient"
        component={Recipient}
        options={{
          animation: 'slide_from_right',
          title: 'Recipient',
          headerShown: false,
        }}
      />

      <Stack.Screen name="UploadnewDocuments"
        component={UploadnewDocuments}
        options={{
          animation: 'slide_from_right',
          title: 'UploadnewDocuments',
          headerShown: false,
        }}
      />

      <Stack.Screen name="Notification"
        component={Notification}
        options={{
          animation: 'slide_from_right',
          title: 'Notification',
          headerShown: false,
        }}
      />

      <Stack.Screen name="withdraw"
        component={withdraw}
        options={{
          animation: 'slide_from_right',
          title: 'withdraw',
          headerShown: false,
        }}
      />

      <Stack.Screen name="AddFund"
        component={AddFund}
        options={{
          animation: 'slide_from_right',
          title: 'AddFund',
          headerShown: false,
        }}
      />

      <Stack.Screen name="AirtimeTopupList"
        component={AirtimeTopupList}
        options={{
          animation: 'slide_from_right',
          title: 'AirtimeTopupList',
          headerShown: false,
        }}
      />

      <Stack.Screen name="AirtimeTopupForm"
        component={AirtimeTopupForm}
        options={{
          animation: 'slide_from_right',
          title: 'AirtimeTopupForm',
          headerShown: false,
        }}
      />

      <Stack.Screen name="AirtimeTopupPay"
        component={AirtimeTopupPay}
        options={{
          animation: 'slide_from_right',
          title: 'AirtimeTopupPay',
          headerShown: false,
        }}
      />

      <Stack.Screen name="QuickAddWatchlistForm"
        component={QuickAddWatchlistForm}
        options={{
          animation: 'slide_from_right',
          title: 'QuickAddWatchlistForm',
          headerShown: false,
        }}
      />





      <Stack.Screen name="ReferandEarn"
        component={ReferandEarn}
        options={{
          animation: 'slide_from_right',
          title: 'ReferandEarn',
          headerShown: false,
        }}
      />


      <Stack.Screen name="Faq"
        component={Faq}
        options={{
          animation: 'slide_from_right',
          title: 'Faq',
          headerShown: false,
        }}
      />


    </Stack.Navigator>
  );
};

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const colorScheme = useColorScheme();

  return (
    <Drawer.Navigator
      initialRouteName="HomeDrawer"
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: "#F0F9FF",
        drawerActiveTintColor: "#0EA5E9",
        drawerInactiveTintColor: "#64748b",

        drawerLabelStyle: {
          fontSize: SIZES.font,
          fontFamily: FONTS.semibold,
          marginLeft: -10,
        },

        drawerItemStyle: {
          borderRadius: 15,
          marginVertical: 4,
          paddingVertical: 4,
          paddingHorizontal: 12,
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}>

      {/* Dashboard */}
      <Drawer.Screen
        name="HomeDrawer"
        component={BottomTabNavigator}
        options={{
          title: "Dashboard",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />

      {/* Post Registration */}
      <Drawer.Screen
        name="PostRegistration"
        component={PostRegistration}
        options={{
          title: "Post Registration",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} />
          ),
        }}
      />

      {/* Wallet */}
      <Drawer.Screen
        name="MyWalletTransfer"
        component={MyWalletTransfer}
        options={{
          title: "My Wallet Balance",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />

      {/* Documents */}
      <Drawer.Screen
        name="IdDocuments"
        component={IdDocuments}
        options={{
          title: "My Documents",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />

      {/* Airtime Topup */}
      <Drawer.Screen
        name="Airtime Topup"
        component={AirtimeTopup}
        options={{
          title: "Airtime Topup",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="cellular" size={size} color={color} />
          ),
        }}
      />

      {/* Watchlist */}
      <Drawer.Screen
        name="Quick Add Watchlist"
        component={QuickAddWatchlist}
        options={{
          title: "Quick Add Watchlist",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />


      {/* Invite & Earn */}
      <Drawer.Screen
        name="ReferandEarn"
        component={ReferandEarn}
        options={{
          title: "Invite & Earn",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="share-social" size={size} color={color} />
          ),
        }}
      />

    </Drawer.Navigator>

  )
}


const BottomTab = createBottomTabNavigator<RootTabParamList>();

const Dashboard = () => {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: COLOR_SCHEME[colorScheme].tint,
      }}>
      <BottomTab.Screen
        name="HomeTab"
        component={Home}
        options={() => ({
          title: "Dashboard",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        })}
      />
      <BottomTab.Screen
        name="RecipientsTab"
        component={Recipients}
        options={() => ({
          title: "Recipients",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color }) => <TabBarIcon name="address-book-o" color={color} />,
        })}
      />
      <BottomTab.Screen
        name="SendMoneyTab"
        component={SendMoney}
        options={({ navigation }) => ({
          animation: 'slide_from_right',
          title: "Send money",
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
          tabBarIcon: () => (

            <View
              style={{
                top: -20,
                height: 70,
                width: 70,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 50,
                backgroundColor: Colors.primary,
                ...SHADOWS.shadow8,
              }}
            >

              <TabShape />
              <Vector
                name="send-o"
                size={30}
                color={Colors.secondary}
                as="fontawesome"
                style={{
                  borderWidth: 2,
                  padding: 5,
                  borderColor: Colors.secondary,
                  borderRadius: 8,
                }}
              />
            </View>
          ),
        })}
      />
      <BottomTab.Screen
        name="TransactionsTab"
        component={Transactions}
        options={() => ({
          title: "Transactions",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color }) => <TabBarIcon name="exchange" color={color} />,
        })}
      />
      <BottomTab.Screen
        name="ProfileTab"
        component={Profile}
        options={{
          title: "Profile",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color }) => <TabBarIcon name="user-circle-o" color={color} />,
        }}
      />

    </BottomTab.Navigator>
  );
};

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return (
    <View>
      <Vector as="fontawesome" size={30} style={{ marginBottom: -3 }} {...props} />
    </View>
  );
}
