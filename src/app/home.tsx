import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';
import { workOrdersApi } from '@/lib/api';
import { WorkOrder, WorkOrderStatus, WorkOrderType } from '@/shared';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  useSync();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isInitialMount = useRef(true);

  const loadWorkOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await workOrdersApi.getMyOrders();
      setWorkOrders(response.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const showLoading = isInitialMount.current;
      if (isInitialMount.current) isInitialMount.current = false;
      loadWorkOrders(showLoading);
    }, [loadWorkOrders]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkOrders(true);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const getStatusLabel = (status: WorkOrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'IN_PROGRESS':
        return 'Em Andamento';
      case 'DONE':
        return 'Concluída';
      case 'CANCELED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: WorkOrderType) => {
    switch (type) {
      case 'DROP_OFF':
        return 'Entrega';
      case 'PICK_UP':
        return 'Retirada';
      case 'EXCHANGE':
        return 'Troca';
      case 'DUMP':
        return 'Descarte';
      default:
        return type;
    }
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    switch (status) {
      case 'PENDING':
        return '#fbbf24';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'DONE':
        return '#10b981';
      case 'CANCELED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const activeOrders = workOrders.filter(
    (wo) => wo.status === 'PENDING' || wo.status === 'IN_PROGRESS',
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Minhas Tarefas</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma tarefa pendente</Text>
          </View>
        ) : (
          activeOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/work-order-detail?id=${order.id}`)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderSequence}>#{order.sequence}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: getStatusColor(order.status) }]}
                  >
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderType}>{getTypeLabel(order.type)}</Text>
              <Text style={styles.orderInfo}>
                {order.dumpster?.code} - {order.vehicle?.placa}
              </Text>
              {order.jobSite && (
                <Text style={styles.orderAddress}>{order.jobSite.address}</Text>
              )}
              {order.yard && <Text style={styles.orderAddress}>{order.yard.name}</Text>}
              {order.scheduledAt && (
                <Text style={styles.orderSchedule}>
                  Agendado: {new Date(order.scheduledAt).toLocaleString('pt-BR')}
                </Text>
              )}
              {order.startedAt && (
                <Text style={styles.orderTime}>
                  Iniciado: {new Date(order.startedAt).toLocaleString('pt-BR')}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0ea5e9',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderSequence: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  orderSchedule: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  orderTime: {
    fontSize: 11,
    color: '#0ea5e9',
    marginTop: 4,
  },
});
