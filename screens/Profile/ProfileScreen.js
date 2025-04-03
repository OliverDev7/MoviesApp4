"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "../../context/ThemeContext"
import { getAuth, signOut, updateProfile } from "firebase/auth"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db, storage } from "../../firebase/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"

export default function ProfileScreen({ navigation }) {
  const { colors, toggleTheme, isDark } = useTheme()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [profileData, setProfileData] = useState({
    watchlist: [],
    watched: [],
    ratings: []
  })
  const [showImageOptions, setShowImageOptions] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        setUser(currentUser)

        if (currentUser) {
          // Obtener datos adicionales del perfil desde Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid))
          if (userDoc.exists()) {
            setProfileData({
              ...profileData,
              ...userDoc.data()
            })
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del perfil:", error)
        Alert.alert("Error", "Could not load profile data")
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    const auth = getAuth()
    try {
      await signOut(auth)
      navigation.replace("Auth")
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.")
    }
  }

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera roll permission to upload images.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image. Please try again.")
    }

    setShowImageOptions(false)
  }

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera permission to take photos.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Failed to take photo. Please try again.")
    }

    setShowImageOptions(false)
  }

  const uploadImage = async (uri) => {
    if (!user) return

    setUploading(true)

    try {
      const response = await fetch(uri)
      const blob = await response.blob()

      const fileRef = ref(storage, `profileImages/${user.uid}`)
      await uploadBytes(fileRef, blob)

      const downloadURL = await getDownloadURL(fileRef)

      await updateProfile(user, { photoURL: downloadURL })

      await updateDoc(doc(db, "users", user.uid), {
        photoURL: downloadURL,
        updatedAt: new Date(),
      })

      setUser({ ...user, photoURL: downloadURL })
      Alert.alert("Success", "Profile picture updated successfully!")
    } catch (error) {
      console.error("Error uploading image:", error)
      Alert.alert("Error", "Failed to update profile picture. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#121212' }]}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={{ color: 'white', marginTop: 16 }}>Loading profile...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>Please sign in to view your profile</Text>
        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: '#E91E63' }]}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={[styles.loginButtonText, { color: 'white' }]}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#121212' }]}>
      <LinearGradient colors={["#1E1E1E", "#121212"]} style={styles.header}>
        <Text style={[styles.title, { color: 'white' }]}>Profile</Text>

        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {uploading ? (
              <View style={[styles.avatar, styles.avatarLoading]}>
                <ActivityIndicator size="small" color="#E91E63" />
              </View>
            ) : (
              <Image
                source={user?.photoURL ? { uri: user.photoURL } : require("../../assets/default_avatar.png")}
                style={styles.avatar}
              />
            )}
           {/*<TouchableOpacity style={styles.editAvatarButton} onPress={() => setShowImageOptions(true)}>
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>*/}
          </View>

          <Text style={[styles.name, { color: 'white' }]}>{user?.displayName || "User"}</Text>
          <Text style={[styles.email, { color: '#AAAAAA' }]}>{user?.email || "user@example.com"}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.menuSection}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionTitle, { color: 'white', marginTop: 24 }]}>Account</Text>

        <View style={[styles.menuContainer, { backgroundColor: '#1E1E1E' }]} >
          <TouchableOpacity style={styles.menuItem} 
          onPress={() => Alert.alert('Próximamente', 'Sección Settings en desarrollo')}>
            <Ionicons name="settings-outline" size={24} color="white" />
            <Text style={[styles.menuText, { color: 'white' }]}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: '#333' }]} />

          <TouchableOpacity style={styles.menuItem}
          onPress={() => Alert.alert('Próximamente', 'Sección Help & Support en desarrollo')}>
            <Ionicons name="help-circle-outline" size={24} color="white" />
            <Text style={[styles.menuText, { color: 'white' }]}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: '#333' }]} />

          <TouchableOpacity style={styles.menuItem} 
          onPress={() => Alert.alert('Próximamente', 'Sección About en desarrollo')}>
            <Ionicons name="information-circle-outline" size={24} color="white" />
            <Text style={[styles.menuText, { color: 'white' }]}>About</Text>
            <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#1E1E1E' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={styles.logoutIcon} />
          <Text style={[styles.logoutText, { color: "#FF3B30" }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowImageOptions(false)}>
          <View style={[styles.modalContent, { backgroundColor: '#1E1E1E' }]}>
            <Text style={[styles.modalTitle, { color: 'white' }]}>Change Profile Picture</Text>

            <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text style={[styles.modalOptionText, { color: 'white' }]}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="white" />
              <Text style={[styles.modalOptionText, { color: 'white' }]}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderTopColor: '#333' }]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={{ color: "#E91E63", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  loginButton: {
    padding: 16,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center'
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  header: {
    padding: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  profileContainer: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarLoading: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#E91E63",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(150, 150, 150, 0.3)",
  },
  menuSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  menuContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  divider: {
    height: 1,
  },
  logoutButton: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
})