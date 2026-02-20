import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { workOrdersApi } from '@/lib/api';
import { storageService } from '@/lib/storage';

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
          } catch (error) {
            console.error('Erro ao sincronizar conclusão:', error);
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
