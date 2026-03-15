import { workOrdersApi } from '@/lib/api';
import { storageService } from '@/lib/storage';
import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';

export function useSync() {
  useEffect(() => {
    const syncPendingCompletions = async () => {
      try {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          return;
        }

        const pending = await storageService.getPendingCompletions();
        if (pending.length === 0) {
          return;
        }

        for (let i = pending.length - 1; i >= 0; i--) {
          const completion = pending[i];
          try {
            const formData = new FormData();
            if (completion.photoUri) {
              formData.append('photo', {
                uri: completion.photoUri,
                type: 'image/jpeg',
                name: 'photo.jpg',
              } as unknown as Blob);
            }
            formData.append('lat', completion.lat.toString());
            formData.append('lng', completion.lng.toString());
            if (completion.accuracy) {
              formData.append('accuracy', completion.accuracy.toString());
            }
            if (completion.notes) {
              formData.append('notes', completion.notes);
            }

            await workOrdersApi.complete(completion.workOrderId, formData);
            await storageService.removePendingCompletion(i);
          } catch (error: unknown) {
            const status = error && typeof error === 'object' && 'response' in error
              ? (error as { response?: { status?: number } }).response?.status
              : undefined;
            if (status === 404 || status === 400) {
              await storageService.removePendingCompletion(i);
            } else {
              console.error('Erro ao sincronizar conclusão:', error);
            }
          }
        }
      } catch (error) {
        console.error('Erro na sincronização:', error);
      }
    };

    syncPendingCompletions();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPendingCompletions();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
