import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons, AntDesign  } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Spacer to push content down */}
      <View style={styles.topSpacer} />

      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://download.logo.wine/logo/LinkedIn/LinkedIn-Logo.wine.png' }}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>
          o <Text style={styles.link}>Únete a LinkedIn</Text>
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email o teléfono"
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#666"
            secureTextEntry
          />
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>¿Has olvidado tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.appleIconContainer}>
            <AntDesign name="apple1" size={20} color="black" />
            </View>
            <Text style={styles.socialButtonText}>Iniciar sesión con Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Image 
              source={{ uri: 'https://img.icons8.com/?size=512&id=17949&format=png' }}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>Iniciar sesión con Google</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom spacer */}
      <View style={styles.bottomSpacer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  topSpacer: {
    height: height * 0.05, // Add space at the top to push content down
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoImage: {
    width: 140,
    height: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10, // Increased padding to push content down
  },
  title: {
    fontSize: 32,
    fontWeight: '400',
    marginBottom: 4,
    color: 'rgba(0, 0, 0, 0.9)',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: 24,
  },
  link: {
    color: '#0A66C2',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  forgotPassword: {
    color: '#0A66C2',
    fontSize: 16,
    fontWeight: '500',
  },
  signInButton: {
    height: 52,
    backgroundColor: '#0A66C2',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signInButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: 'rgba(0, 0, 0, 0.9)',
    fontSize: 14,
  },
  socialButtons: {
    gap: 8,
  },
  socialButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 28,
    paddingHorizontal: 24,
    gap: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  appleIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleIcon: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  socialButtonText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: height * 0.05, // Add space at the bottom
  },
});