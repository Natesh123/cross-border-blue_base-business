import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { GetDocumentList, RemitterUpgrade } from "app/http-services";
import { useRecoilValue } from "recoil";
import { ProfileState } from "app/atoms";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const UploadnewDocuments: React.FC = () => {
  const currentToken = useRecoilValue(ProfileState);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState<any>({ value: "", error: "" });
  const [documentGroups, setDocumentGroups] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [frontDoc, setFrontDoc] = useState<any>(null);
  const [backDoc, setBackDoc] = useState<any>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (isFocused) {
      fetchDocumentList(currentToken.tokenId);
    }
  }, [isFocused]);

  const getExtensionFromMime = (mime: string) => {
    switch (mime) {
      case "image/png": return ".png";
      case "image/jpeg":
      case "image/jpg": return ".jpg";
      case "application/pdf": return ".pdf";
      default: return "";
    }
  };

  const fetchDocumentList = async (tokenId: string) => {
    try {
      setLoading(true);
      const res = await GetDocumentList(tokenId);
      if (res.status === 200 && res.data.StatusCode === "ER0000") {
        const types = Array.isArray(res.data.DocumentTypes) ? res.data.DocumentTypes : [];
        let groupedDocs = types.map((type: any) => ({
          type: type.Type || "",
          typeDocuments: Array.isArray(type.Documents) ? type.Documents : [],
          subCategories: Array.isArray(type.SubCategories) ? type.SubCategories.map((sub: any) => ({
            name: sub?.Name?.trim() ? sub.Name : null,
            documents: Array.isArray(sub.Documents) ? sub.Documents : [],
          })) : [],
          expanded: false,
          visibleSubCategory: null,
        }));
        groupedDocs.sort((a: any, b: any) => {
          const aIsID = a.type.toLowerCase().startsWith("id-");
          const bIsID = b.type.toLowerCase().startsWith("id-");
          if (aIsID && !bIsID) return -1;
          if (!aIsID && bIsID) return 1;
          return 0;
        });
        setDocumentGroups(groupedDocs);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async (side: "front" | "back") => {
    if (!documentType.value) {
      setShowPopup(true);
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        if (file.size && file.size > 2 * 1024 * 1024) {
          alert("File is too large! Please upload a file smaller than 2MB.");
          return;
        }
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          if (side === "front") setFrontDoc({ ...file, base64 });
          else setBackDoc({ ...file, base64 });
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      console.log("Error picking file:", err);
    }
  };

  const handleUpload = async () => {
    if (!documentType.value) {
      setDocumentType((prev: any) => ({ ...prev, error: "Please select document type" }));
      return;
    }
    if (!frontDoc || !backDoc) {
      alert("Please select both front and back files");
      return;
    }
    try {
      setLoading(true);
      const req = {
        TokenId: currentToken.tokenId,
        RemitterId: currentToken.remitterId,
        IdType: documentType.value,
        ImageType: getExtensionFromMime(frontDoc.mimeType),
        Imagebase64: frontDoc.base64,
        Imagename: frontDoc.name || `front${getExtensionFromMime(frontDoc.mimeType)}`,
        BackSideImageType: getExtensionFromMime(backDoc.mimeType),
        BackSideImagebase64: backDoc.base64,
        BackSideImagename: backDoc.name || `back${getExtensionFromMime(backDoc.mimeType)}`,
      };
      const res = await RemitterUpgrade(req);
      if (res.data.StatusCode === "ER0000") setShowSuccessPopup(true);
      else alert(res.data.Status || "Upload failed");
    } catch (e) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const renderUploadZone = (side: "front" | "back") => {
    const file = side === "front" ? frontDoc : backDoc;
    const label = side === "front" ? "Front Side" : "Back Side";
    const icon = side === "front" ? "image-outline" : "images-outline";

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => pickFile(side)}
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: 28,
          padding: 24,
          borderWidth: 2.5,
          borderColor: file ? '#10B981' : '#F1F5F9',
          borderStyle: file ? 'solid' : 'dashed',
          alignItems: 'center',
          shadowColor: "#10B981",
          shadowOpacity: file ? 0.15 : 0,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 20,
          elevation: file ? 10 : 0,
        }}
      >
        <View style={{
          width: 56,
          height: 56,
          backgroundColor: file ? '#ECFDF5' : '#F8FAFC',
          borderRadius: 18,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 14,
          borderWidth: 1.5,
          borderColor: file ? '#A7F3D0' : '#E2E8F0'
        }}>
          <Ionicons name={file ? "checkmark-done-circle" : icon} size={28} color={file ? '#10B981' : '#94A3B8'} />
        </View>

        <Text style={{ fontSize: 12, fontWeight: '900', color: '#1E293B', marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontSize: 9, color: '#94A3B8', fontWeight: '700', marginBottom: 12 }}>{file ? "Ready to upload" : "Select file"}</Text>

        {file ? (
          <View style={{ width: '100%', height: 90, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 5 }}>
            {file.mimeType === "application/pdf" ? (
              <View style={{ flex: 1, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="document-text" size={36} color="#EF4444" />
                <Text style={{ fontSize: 9, color: '#EF4444', fontWeight: '800', marginTop: 4 }}>PDF DOC</Text>
              </View>
            ) : (
              <Image source={{ uri: file.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            )}
          </View>
        ) : (
          <View style={{
            backgroundColor: '#0EA5E9',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 14,
            marginTop: 10
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>Browse</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <LinearGradient
        colors={["#0EA5E9", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 25,
          paddingVertical: 28,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          elevation: 20,
          shadowColor: '#0EA5E9',
          shadowOpacity: 0.4,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 20
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff", letterSpacing: -0.5 }}>Verification Center</Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: "600", marginTop: 2 }}>Your security is our top priority</Text>
          </View>
          <Ionicons name="shield-checkmark" size={32} color="rgba(255,255,255,0.9)" />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={{ padding: 25 }}>

          <View style={{ marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: "900", fontSize: 10, color: "#94A3B8", textTransform: 'uppercase', letterSpacing: 1.5 }}>Step 01 / 02</Text>
              <View style={{ height: 2, flex: 1, backgroundColor: '#F1F5F9', marginHorizontal: 15 }} />
              <Text style={{ fontWeight: "900", fontSize: 11, color: "#1E293B", textTransform: 'uppercase' }}>Select Type</Text>
            </View>

            <View style={{ backgroundColor: "#F8FAFC", borderRadius: 24, padding: 4, borderWidth: 1.5, borderColor: documentType.error ? '#FECACA' : '#F1F5F9' }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { setShowDropdown(!showDropdown); setDocumentGroups(documentGroups.map(g => ({ ...g, expanded: false, visibleSubCategory: null }))); }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 20,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 40, height: 40, backgroundColor: '#E0F2FE', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                    <Ionicons name="document-lock" size={20} color="#0EA5E9" />
                  </View>
                  <Text style={{ fontWeight: "800", fontSize: 14, color: documentType.value ? "#1E293B" : "#BFC9D3" }}>
                    {documentType.value?.includes(",") ? documentType.value.split(",")[1].trim() : (documentType.value || "Select Document")}
                  </Text>
                </View>
                <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#94A3B8" />
              </TouchableOpacity>

              {showDropdown && (
                <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', maxHeight: 350 }}>
                  <ScrollView nestedScrollEnabled>
                    {documentGroups.map((group, gIndex) => (
                      <View key={group.type}>
                        <TouchableOpacity
                          onPress={() => setDocumentGroups(documentGroups.map((g, i) => ({ ...g, expanded: i === gIndex ? !g.expanded : false, visibleSubCategory: null })))}
                          style={{ padding: 16, backgroundColor: group.expanded ? '#F1F5F9' : 'transparent', borderLeftWidth: group.expanded ? 4 : 0, borderLeftColor: '#0EA5E9' }}>
                          <Text style={{ fontWeight: "900", fontSize: 14, color: group.expanded ? '#0EA5E9' : '#475569' }}>{group.type}</Text>
                        </TouchableOpacity>

                        {group.expanded && (
                          <View style={{ backgroundColor: '#FCFDFF' }}>
                            {group.typeDocuments.map((doc: string) => (
                              <TouchableOpacity
                                key={doc}
                                onPress={() => { setDocumentType({ value: `${group.type}, ${doc}`, error: "" }); setShowDropdown(false); }}
                                style={{ padding: 16, paddingLeft: 25, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' }}>
                                <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '600' }}>{doc}</Text>
                              </TouchableOpacity>
                            ))}
                            {group.subCategories.map((sub: any, sIndex: number) => (
                              <View key={sIndex}>
                                {sub.name && (
                                  <TouchableOpacity
                                    onPress={() => { const updated = [...documentGroups]; updated[gIndex].visibleSubCategory = updated[gIndex].visibleSubCategory === sub.name ? null : sub.name; setDocumentGroups(updated); }}
                                    style={{ padding: 14, paddingLeft: 25, backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontWeight: '800', fontSize: 13, color: '#1E293B' }}>{sub.name}</Text>
                                    <Ionicons name={group.visibleSubCategory === sub.name ? "chevron-up" : "chevron-down"} size={16} color="#94A3B8" />
                                  </TouchableOpacity>
                                )}
                                {(group.visibleSubCategory === sub.name || !sub.name) && sub.documents.map((doc: string) => (
                                  <TouchableOpacity
                                    key={doc}
                                    onPress={() => { setDocumentType({ value: `${group.type}, ${doc}`, error: "" }); setShowDropdown(false); }}
                                    style={{ padding: 14, paddingLeft: 35, borderBottomWidth: 1, borderBottomColor: '#FCFDFF' }}>
                                    <Text style={{ fontSize: 14, color: '#64748B' }}>{doc}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: "900", fontSize: 10, color: "#94A3B8", textTransform: 'uppercase', letterSpacing: 1.5 }}>Step 02 / 02</Text>
              <View style={{ height: 2, flex: 1, backgroundColor: '#F1F5F9', marginHorizontal: 15 }} />
              <Text style={{ fontWeight: "900", fontSize: 11, color: "#1E293B", textTransform: 'uppercase' }}>Upload Image</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 20, marginBottom: 30 }}>
              {renderUploadZone("front")}
              {renderUploadZone("back")}
            </View>

            <View style={{ backgroundColor: '#F8FAFC', padding: 18, borderRadius: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
              <View style={{ width: 36, height: 36, backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, elevation: 2 }}>
                <Ionicons name="bulb-outline" size={20} color="#EAB308" />
              </View>
              <Text style={{ flex: 1, fontSize: 10, color: "#64748B", fontWeight: "700", lineHeight: 18 }}>
                TIP: Place your document on a flat, dark surface with good lighting for best results.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25, backgroundColor: '#fff', borderTopWidth: 1.5, borderTopColor: '#F8FAFC', paddingTop: 20 }}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            height: 64,
            borderRadius: 22,
            backgroundColor: "#0EA5E9",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            elevation: 12,
            shadowColor: '#0EA5E9',
            shadowOpacity: 0.4,
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 18
          }}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16, letterSpacing: 0.2 }}>Proceed to Verification</Text>
              <View style={{ width: 28, height: 28, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }}>
                <Ionicons name="arrow-up" size={18} color="#fff" />
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* REFINED ERROR MODAL */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(15, 23, 42, 0.75)" }}>
          <View style={{ width: "85%", backgroundColor: "#fff", borderRadius: 32, padding: 30, alignItems: "center", shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 20 }, shadowRadius: 30 }}>
            <View style={{ width: 70, height: 70, backgroundColor: '#FEF2F2', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 22, borderWidth: 1, borderColor: '#FEE2E2' }}>
              <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', marginBottom: 12, color: '#1E293B', letterSpacing: -0.5 }}>Selection Required</Text>
            <Text style={{ fontSize: 13, marginBottom: 30, textAlign: "center", color: '#64748B', fontWeight: '600', lineHeight: 22 }}>Please select a document type before selecting files. This ensures your verification is processed correctly.</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPopup(false)}
              style={{ height: 58, width: '100%', backgroundColor: "#1E293B", borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#1E293B', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 10 }, shadowRadius: 15, elevation: 8 }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15, letterSpacing: 1 }}>UNDERSTOOD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* REFINED SUCCESS MODAL */}
      <Modal visible={showSuccessPopup} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(15, 23, 42, 0.75)" }}>
          <View style={{ width: "88%", backgroundColor: '#fff', borderRadius: 36, paddingHorizontal: 35, paddingVertical: 40, alignItems: "center", shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 25 }, shadowRadius: 35 }}>
            <View style={{ width: 80, height: 80, backgroundColor: '#ECFDF5', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#D1FAE5' }}>
              <Ionicons name="ribbon-outline" size={44} color="#10B981" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '900', marginBottom: 12, color: '#064E3B', letterSpacing: -0.5 }}>Submission Successful</Text>
            <Text style={{ fontSize: 13, marginBottom: 35, textAlign: "center", color: '#4B5563', fontWeight: '600', lineHeight: 22 }}>Your documents are now being reviewed by our compliance team. We'll notify you shortly.</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => { setShowSuccessPopup(false); navigation.navigate("IdDocuments" as never); }}
              style={{ height: 60, width: '100%', backgroundColor: "#0EA5E9", borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#0EA5E9', shadowOpacity: 0.3, shadowRadius: 10 }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>GO TO DOCUMENTS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UploadnewDocuments;
