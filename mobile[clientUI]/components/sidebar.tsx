import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { palette } from '@/constants/palette';

export const SIDEBAR_WIDTH = 260;

type MenuIcon = (props: { color: string; size: number }) => JSX.Element;

const MENU_ITEMS: Array<{
  id: string;
  label: string;
  mobileLabel?: string;
  icon: MenuIcon;
}> = [
  {
    id: 'clients',
    label: 'Client Management',
    mobileLabel: 'Clients',
    icon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
  },
  {
    id: 'billing',
    label: 'Billing & Plans',
    mobileLabel: 'Billing',
    icon: ({ color, size }) => <Feather name="credit-card" size={size} color={color} />,
  },
  {
    id: 'support',
    label: 'Support',
    mobileLabel: 'Support',
    icon: ({ color, size }) => <Feather name="life-buoy" size={size} color={color} />,
  },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <View style={styles.brandIcon}>
          <MaterialCommunityIcons name="dumbbell" size={20} color={palette.slate100} />
        </View>
        <View>
          <Text style={styles.brandTitle}>FalseGrip</Text>
          <Text style={styles.brandSubtitle}>Trainer Dashboard</Text>
        </View>
      </View>

      <View style={styles.sidebarNav}>
        {MENU_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onViewChange(item.id)}
              style={({ pressed }) => [
                styles.navItem,
                isActive && styles.navItemActive,
                pressed && !isActive && styles.navItemPressed,
              ]}
            >
              {item.icon({
                color: isActive ? palette.white : palette.slate400,
                size: 18,
              })}
              <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sidebarFooter}>
        <Pressable style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}>
          <Feather name="settings" size={18} color={palette.slate400} />
          <Text style={styles.navItemText}>Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function MobileNav({ activeView, onViewChange }: SidebarProps) {
  return (
    <View style={styles.mobileNav}>
      <View style={styles.mobileHeader}>
        <View style={styles.mobileBrand}>
          <View style={styles.mobileIcon}>
            <MaterialCommunityIcons name="dumbbell" size={18} color={palette.slate100} />
          </View>
          <View>
            <Text style={styles.mobileTitle}>FalseGrip</Text>
            <Text style={styles.mobileSubtitle}>Trainer Dashboard</Text>
          </View>
        </View>
        <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
          <Feather name="settings" size={18} color={palette.slate300} />
        </Pressable>
      </View>

      <View style={styles.mobileMenu}>
        {MENU_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onViewChange(item.id)}
              style={({ pressed }) => [
                styles.mobileMenuItem,
                isActive && styles.mobileMenuItemActive,
                pressed && !isActive && styles.mobileMenuItemPressed,
              ]}
            >
              {item.icon({
                color: isActive ? palette.white : palette.slate300,
                size: 16,
              })}
              <Text style={[styles.mobileMenuText, isActive && styles.mobileMenuTextActive]}>
                {item.mobileLabel ?? item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: palette.slate950,
    borderRightWidth: 1,
    borderRightColor: palette.slate800,
    paddingBottom: 16,
  },
  sidebarHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate800,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: palette.slate700,
  },
  brandTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '600',
  },
  brandSubtitle: {
    color: palette.slate400,
    fontSize: 12,
  },
  sidebarNav: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  sidebarFooter: {
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: palette.slate800,
    paddingTop: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  navItemActive: {
    backgroundColor: palette.slate800,
  },
  navItemPressed: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  navItemText: {
    color: palette.slate400,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    flexShrink: 1,
  },
  navItemTextActive: {
    color: palette.white,
  },
  mobileNav: {
    backgroundColor: palette.slate950,
    borderBottomWidth: 1,
    borderBottomColor: palette.slate800,
  },
  mobileHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: palette.slate700,
  },
  mobileTitle: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600',
  },
  mobileSubtitle: {
    color: palette.slate400,
    fontSize: 11,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  mobileMenu: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  mobileMenuItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  mobileMenuItemActive: {
    backgroundColor: palette.slate800,
  },
  mobileMenuItemPressed: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  mobileMenuText: {
    color: palette.slate300,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  mobileMenuTextActive: {
    color: palette.white,
  },
});
