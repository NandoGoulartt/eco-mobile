import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useLocation } from '@/hooks/useLocation';
import { deliveriesApi, dumpstersApi, jobSitesApi } from '@/lib/api';
import { storageService } from '@/lib/storage';
import { CreateDeliveryDto, DeliveryType, Dumpster, JobSite } from '@/shared';

export default function DeliveryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const dumpsterId = params.dumpsterId as string;

  const { getCurrentLocation, loading: locationLoading } = useLocation();
  const [loading, setLoading] = useState(false);
  const [dumpster, setDumpster] = useState<Dumpster | null>(null);
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [selectedJobSite, setSelectedJobSite] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [dumpsterRes, jobSitesRes] = await Promise.all([
        dumpstersApi.getById(dumpsterId),
        jobSitesApi.getAll(),
      ]);
      setDumpster(dumpsterRes.data);
      setJobSites(jobSitesRes.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os dados');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  }, [dumpsterId, router]);

  useEffect(() => {
    if (!dumpsterId) {
      Alert.alert('Erro', 'Caçamba não informada');
      router.back();
      return;
    }
    loadData();
  }, [dumpsterId, loadData, router]);

  const handleGetLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy || undefined,
      });
      Alert.alert('Sucesso', 'Localização capturada com sucesso!');
    } else {
      Alert.alert('Erro', 'Não foi possível obter a localização');
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'É necessário permissão para usar a câmera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!deliveryType) {
      Alert.alert('Erro', 'Selecione o tipo de operação');
      return;
    }

    if (!selectedJobSite) {
      Alert.alert('Erro', 'Selecione uma obra');
      return;
    }

    if (!location) {
      Alert.alert('Erro', 'É necessário capturar a localização GPS');
      return;
    }

    setLoading(true);

    try {
      const deliveryData: CreateDeliveryDto = {
        type: deliveryType,
        dumpsterId,
        jobSiteId: selectedJobSite,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        notes: notes || undefined,
        photoUrl: photoUri || undefined,
      };

      try {
        await deliveriesApi.create(deliveryData);
        Alert.alert('Sucesso', 'Entrega registrada com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } catch {
        await storageService.savePendingDelivery(deliveryData);
        Alert.alert(
          'Salvo offline',
          'A entrega foi salva localmente e será sincronizada quando houver conexão.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Não foi possível registrar a entrega';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || !dumpster) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
      <View style={styles.content}>
        <Text style={styles.title}>Registrar Entrega/Retirada</Text>
        <Text style={styles.subtitle}>Caçamba: {dumpster?.code}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Tipo de Operação</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                deliveryType === DeliveryType.DROP_OFF && styles.typeButtonActive,
              ]}
              onPress={() => setDeliveryType(DeliveryType.DROP_OFF)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  deliveryType === DeliveryType.DROP_OFF && styles.typeButtonTextActive,
                ]}
              >
                Deixar Caçamba
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                deliveryType === DeliveryType.PICK_UP && styles.typeButtonActive,
              ]}
              onPress={() => setDeliveryType(DeliveryType.PICK_UP)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  deliveryType === DeliveryType.PICK_UP && styles.typeButtonTextActive,
                ]}
              >
                Retirar Caçamba
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Obra</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {jobSites.map((site) => (
              <TouchableOpacity
                key={site.id}
                style={[
                  styles.jobSiteButton,
                  selectedJobSite === site.id && styles.jobSiteButtonActive,
                ]}
                onPress={() => setSelectedJobSite(site.id)}
              >
                <Text
                  style={[
                    styles.jobSiteText,
                    selectedJobSite === site.id && styles.jobSiteTextActive,
                  ]}
                >
                  {site.address}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Localização GPS</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleGetLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.locationButtonText}>
                {location ? 'Localização Capturada ✓' : 'Capturar Localização'}
              </Text>
            )}
          </TouchableOpacity>
          {location && (
            <Text style={styles.locationText}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              {location.accuracy && ` (Precisão: ${location.accuracy.toFixed(0)}m)`}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Foto (Opcional)</Text>
          <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
            <Text style={styles.photoButtonText}>
              {photoUri ? 'Foto Capturada ✓' : 'Tirar Foto'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Observações (Opcional)</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Digite observações..."
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Registrar</Text>
          )}
        </TouchableOpacity>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#0ea5e9',
    backgroundColor: '#e0f2fe',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#0ea5e9',
  },
  jobSiteButton: {
    padding: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  jobSiteButtonActive: {
    borderColor: '#0ea5e9',
    backgroundColor: '#e0f2fe',
  },
  jobSiteText: {
    fontSize: 14,
    color: '#666',
  },
  jobSiteTextActive: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#0ea5e9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  photoButton: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0ea5e9',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
