import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function App() {
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Main Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: "https://images.adsttc.com/media/images/5d34/e507/284d/d109/5600/0240/large_jpg/_FI.jpg?1563747560" }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        
        {/* Header Buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.rightButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="share-2" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="heart-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Carousel */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          <Image 
            source={{ uri: "https://bihomes.es/app/uploads/2022/10/diseno-interiores-salon-casa.jpg" }}
            style={styles.thumbnailImage}
          />
          <Image 
            source={{ uri: "https://images.adsttc.com/media/images/58e4/5d6f/e58e/ceb8/1100/01fb/large_jpg/3Z6A4252.jpg?1491361128" }}
            style={styles.thumbnailImage}
          />
          <Image 
            source={{ uri: "https://www.juliapinturas.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2022/05/como-pintar-una-casa-rustica-interior.jpg.webp" }}
            style={styles.thumbnailImage}
          />
          <Image 
            source={{ uri: "https://www.utopia-projects.com/wp-content/uploads/2018/09/House-with-swimming-pool.webp" }}
            style={styles.thumbnailImage}
          />
          <View style={styles.lastThumbnail}>
            <Text style={styles.morePhotos}>10+</Text>
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.category}>Tipo: Casa</Text>
            <Text style={styles.price}>$150m <Text style={styles.priceMonth}>/Venta</Text></Text>
          </View>
          <Text style={styles.propertyName}>Casa en venta</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.location}>Ubicacion</Text>
          </View>
        </View>

        {/* Specifications */}
        <View style={styles.specifications}>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="bed-outline" size={24} color="#666" />
            <Text style={styles.specValue}>5 Dormitorios</Text>
          </View>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="shower" size={24} color="#666" />
            <Text style={styles.specValue}>4 Baños</Text>
          </View>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="floor-plan" size={24} color="#666" />
            <Text style={styles.specValue}>5,980 Sqft</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.description}>
          <Text style={styles.sectionTitle}>Descripcion</Text>
          <Text style={styles.descriptionText}>
          Casa ubicada en una zona tranquila y de fácil acceso,
           esta encantadora propiedad ofrece todo lo que necesitas 
           para vivir cómodamente. Con un diseño moderno y funcional,
            esta casa cuenta con amplios espacios ideales para la familia{' '}
            <Text style={styles.readMore}>Leer mas...</Text>
          </Text>
        </View>

        {/* Listing Broker */}
        <View style={styles.broker}>
          <Text style={styles.sectionTitle}>Propietario</Text>
          <View style={styles.brokerInfo}>
            <View style={styles.brokerProfile}>
              <Image 
                source={{ uri: "https://scontent-scl2-1.cdninstagram.com/v/t51.2885-19/475092208_595883099915987_4464799292263566076_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=scontent-scl2-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2AG8yHjLSkjEs8r736Cc5TolOExWCwk-Fl6-jSVH9Qdvg-uA2TEe3mgGSbRoZG8nBwM&_nc_ohc=JQk2hnT4WFMQ7kNvgFfsCwB&_nc_gid=af1d8bb15f794eb8b4de78b842a5950d&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYEofcvDxDVkTuokjmCsm-Qi4uxmahyHLt8WzPRrtRgm7g&oe=67D945C2&_nc_sid=8b3546" }}
                style={styles.brokerImage}
              />
              <View>
                <Text style={styles.brokerName}>Oliver dev</Text>
                <Text style={styles.brokerPhone}>9-104-990-178</Text>
              </View>
            </View>
            <View style={styles.brokerActions}>
              <TouchableOpacity style={styles.brokerButton}>
                <Ionicons name="chatbubble" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.brokerButton}>
                <Ionicons name="call" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Extra space to ensure content isn't hidden behind the Book Now button */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookButtonContainer}>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Llamar ahora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  imageContainer: {
    height: width * 0.8,
    backgroundColor: '#F0F0F0',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    top: 
    Platform.OS === 
    'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
    'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carousel: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    height: 64,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  thumbnailImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  lastThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 
    'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotos: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
  },
  priceMonth: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  propertyName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  specifications: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 20,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  description: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    lineHeight: 20,
  },
  readMore: {
    color: '#000',
    fontWeight: '500',
  },
  broker: {
    marginBottom: 20, // Reduced from 80 to 20
  },
  brokerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brokerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brokerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  brokerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  brokerPhone: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  brokerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  brokerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#004D40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpace: {
    height: 80, // Space to ensure content isn't hidden behind the button
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bookButton: {
    height: 56,
    backgroundColor: '#004D40',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});