import React from 'react';
import { Image, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { palette } from '@/constants/palette';

export type Client = {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  avatar?: string;
  program: string;
  healthScore: number;
  mealAdherence: number;
  checkIns: number;
  weightTrend: 'up' | 'down' | 'stable';
};

interface ClientCardProps {
  client: Client;
  onSelect: (client: Client) => void;
  style?: StyleProp<ViewStyle>;
}

export function ClientCard({ client, onSelect, style }: ClientCardProps) {
  const initials = client.name
    .split(' ')
    .map((name) => name[0])
    .join('');

  return (
    <Pressable
      onPress={() => onSelect(client)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}
    >
      <View style={styles.header}>
        <View style={styles.healthRing}>
          <Text style={styles.healthScore}>{client.healthScore}%</Text>
        </View>
        <View style={styles.avatar}>
          {client.avatar ? (
            <Image source={{ uri: client.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarFallback}>{initials}</Text>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{client.name}</Text>
          <View style={[styles.badge, styles[`badge${client.status}`]]}>
            <Text style={[styles.badgeText, client.status !== 'active' && styles.badgeTextMuted]}>
              {client.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricBox
          label="Meals"
          value={`${client.mealAdherence}%`}
          icon={<MaterialCommunityIcons name="silverware-fork-knife" size={14} color={palette.slate500} />}
        />
        <MetricBox
          label="Check-ins"
          value={`${client.checkIns}/7`}
          icon={<Feather name="check-circle" size={14} color={palette.slate500} />}
        />
        <MetricBox
          label="Weight"
          value={client.weightTrend}
          icon={<TrendIcon trend={client.weightTrend} />}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Feather name="users" size={14} color={palette.slate500} />
          <Text style={styles.detailText} numberOfLines={1}>
            {client.program}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="clock" size={14} color={palette.slate500} />
          <Text style={styles.detailText}>Last active {client.lastActive}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <Text style={styles.footerText}>Manage Configuration</Text>
          <Feather name="arrow-right" size={14} color={palette.slate500} />
        </View>
      </View>
    </Pressable>
  );
}

function MetricBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.metricBox}>
      <View style={styles.metricLabel}>
        {icon}
        <Text style={styles.metricLabelText}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function TrendIcon({ trend }: { trend: Client['weightTrend'] }) {
  if (trend === 'up') {
    return <Feather name="trending-up" size={14} color={palette.red500} />;
  }
  if (trend === 'down') {
    return <Feather name="trending-down" size={14} color={palette.green500} />;
  }
  return <Feather name="minus" size={14} color={palette.slate400} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.slate200,
    paddingBottom: 16,
    overflow: 'hidden',
    shadowColor: palette.black,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerText: {
    flex: 1,
  },
  healthRing: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 6,
    borderColor: palette.emerald500,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.slate50,
  },
  healthScore: {
    fontSize: 10,
    fontWeight: '700',
    color: palette.slate700,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.white,
    marginRight: 12,
    shadowColor: palette.black,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    color: palette.slate700,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.slate900,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 6,
  },
  badgeactive: {
    backgroundColor: palette.slate900,
  },
  badgepending: {
    backgroundColor: palette.slate100,
  },
  badgeinactive: {
    backgroundColor: palette.slate100,
  },
  badgeText: {
    fontSize: 11,
    color: palette.white,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  badgeTextMuted: {
    color: palette.slate700,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: palette.slate50,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabelText: {
    fontSize: 11,
    color: palette.slate500,
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.slate900,
    textTransform: 'capitalize',
  },
  details: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 12,
    color: palette.slate500,
    flexShrink: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: palette.slate50,
  },
  footerText: {
    fontSize: 12,
    color: palette.slate700,
    fontWeight: '500',
  },
});
