import { useEffect } from 'react';
import { workOrdersApi } from '@/lib/api';
import { storageService } from '@/lib/storage';
import NetInfo from '@react-native-community/netinfo';

export function useSync() {
  useEffect(() => {
    const syncPendingCompletions = async () => {
      try {
        // Verificar conexão
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          return;
        }

        const pending = await storageService.getPendingCompletions();
        if (pending.length === 0) {
          return;
        }

        // Tentar sincronizar cada conclusão pendente
        for (let i = pending.length - 1; i >= 0; i--) {
          const completion = pending[i];
          try {
            const formData = new FormData();
            // Só adicionar foto se existir
            if (completion.photoUri) {
              formData.append('photo', {
                uri: completion.photoUri,
                type: 'image/jpeg',
                name: 'photo.jpg',
              } as any);
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
            // Remover da lista de pendentes
            await storageService.removePendingCompletion(i);
          } catch (error) {
            console.error('Erro ao sincronizar conclusão:', error);
            // Manter na lista para tentar novamente depois
          }
        }
      } catch (error) {
        console.error('Erro na sincronização:', error);
      }
    };

    // Sincronizar ao montar
    syncPendingCompletions();

    // Sincronizar quando conexão voltar
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
