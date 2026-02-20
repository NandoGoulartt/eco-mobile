import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateDeliveryDto } from '@/shared';

const PENDING_DELIVERIES_KEY = '@pending_deliveries';
const PENDING_COMPLETIONS_KEY = '@pending_completions';

export const storageService = {
  // Salvar entrega pendente (offline)
  savePendingDelivery: async (delivery: CreateDeliveryDto): Promise<void> => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_DELIVERIES_KEY);
      const deliveries: CreateDeliveryDto[] = pending ? JSON.parse(pending) : [];
      deliveries.push(delivery);
      await AsyncStorage.setItem(PENDING_DELIVERIES_KEY, JSON.stringify(deliveries));
    } catch (error) {
      console.error('Erro ao salvar entrega pendente:', error);
    }
  },

  // Obter entregas pendentes
  getPendingDeliveries: async (): Promise<CreateDeliveryDto[]> => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_DELIVERIES_KEY);
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('Erro ao obter entregas pendentes:', error);
      return [];
    }
  },

  // Remover entrega pendente
  removePendingDelivery: async (index: number): Promise<void> => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_DELIVERIES_KEY);
      const deliveries: CreateDeliveryDto[] = pending ? JSON.parse(pending) : [];
      deliveries.splice(index, 1);
      await AsyncStorage.setItem(PENDING_DELIVERIES_KEY, JSON.stringify(deliveries));
    } catch (error) {
      console.error('Erro ao remover entrega pendente:', error);
    }
  },

  // Limpar todas as entregas pendentes
  clearPendingDeliveries: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(PENDING_DELIVERIES_KEY);
    } catch (error) {
      console.error('Erro ao limpar entregas pendentes:', error);
    }
  },

  // Salvar conclusão pendente (offline)
  savePendingCompletion: async (completion: any): Promise<void> => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_COMPLETIONS_KEY);
      const completions = pending ? JSON.parse(pending) : [];
      completions.push(completion);
      await AsyncStorage.setItem(PENDING_COMPLETIONS_KEY, JSON.stringify(completions));
    } catch (error) {
      console.error('Erro ao salvar conclusão pendente:', error);
    }
  },

  // Obter conclusões pendentes
  getPendingCompletions: async (): Promise<any[]> => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_COMPLETIONS_KEY);
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('Erro ao obter conclusões pendentes:', error);
      return [];
    }
  },

  // Remover conclusão pendente
  removePendingCompletion: async (index: number): Promise<void> => {
    try {
      const pending = await AsyncStorage.getItem(PENDING_COMPLETIONS_KEY);
      const completions = pending ? JSON.parse(pending) : [];
      completions.splice(index, 1);
      await AsyncStorage.setItem(PENDING_COMPLETIONS_KEY, JSON.stringify(completions));
    } catch (error) {
      console.error('Erro ao remover conclusão pendente:', error);
    }
  },
};
