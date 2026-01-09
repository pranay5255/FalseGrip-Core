import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { Client, ClientCard } from '@/components/client-card';
import { MobileNav, Sidebar, SIDEBAR_WIDTH } from '@/components/sidebar';
import { palette } from '@/constants/palette';

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    status: 'active',
    lastActive: '2 hours ago',
    program: 'Weight Loss & Toning',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    healthScore: 88,
    mealAdherence: 92,
    checkIns: 7,
    weightTrend: 'down',
  },
  {
    id: '2',
    name: 'Mike Chen',
    status: 'active',
    lastActive: '5 mins ago',
    program: 'Hypertrophy Basics',
    avatar: 'https://i.pravatar.cc/150?u=mike',
    healthScore: 75,
    mealAdherence: 65,
    checkIns: 4,
    weightTrend: 'up',
  },
  {
    id: '3',
    name: 'Emma Davis',
    status: 'pending',
    lastActive: '1 day ago',
    program: 'Post-Injury Recovery',
    avatar: 'https://i.pravatar.cc/150?u=emma',
    healthScore: 60,
    mealAdherence: 40,
    checkIns: 2,
    weightTrend: 'stable',
  },
  {
    id: '4',
    name: 'James Wilson',
    status: 'inactive',
    lastActive: '2 weeks ago',
    program: 'Marathon Prep',
    avatar: 'https://i.pravatar.cc/150?u=james',
    healthScore: 45,
    mealAdherence: 20,
    checkIns: 0,
    weightTrend: 'stable',
  },
];

type TabIcon = (props: { color: string; size: number }) => JSX.Element;

const CLIENT_TABS: Array<{
  value: string;
  label: string;
  shortLabel: string;
  icon: TabIcon;
}> = [
  {
    value: 'intake',
    label: 'Intake & Onboarding',
    shortLabel: 'Intake',
    icon: ({ color, size }) => <Feather name="clipboard" size={size} color={color} />,
  },
  {
    value: 'safety',
    label: 'Safety Guardrails',
    shortLabel: 'Safety',
    icon: ({ color, size }) => <Feather name="shield" size={size} color={color} />,
  },
  {
    value: 'chat',
    label: 'Chat & Persona',
    shortLabel: 'Chat',
    icon: ({ color, size }) => <Feather name="message-square" size={size} color={color} />,
  },
  {
    value: 'rituals',
    label: 'Daily Rituals',
    shortLabel: 'Rituals',
    icon: ({ color, size }) => <Feather name="sun" size={size} color={color} />,
  },
  {
    value: 'habits',
    label: 'Habits & Streaks',
    shortLabel: 'Habits',
    icon: ({ color, size }) => <Feather name="award" size={size} color={color} />,
  },
  {
    value: 'nutrition',
    label: 'Nutrition',
    shortLabel: 'Nutrition',
    icon: ({ color, size }) => (
      <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />
    ),
  },
  {
    value: 'training',
    label: 'Training & Form',
    shortLabel: 'Training',
    icon: ({ color, size }) => (
      <MaterialCommunityIcons name="dumbbell" size={size} color={color} />
    ),
  },
  {
    value: 'education',
    label: 'Education & Science',
    shortLabel: 'Education',
    icon: ({ color, size }) => <MaterialCommunityIcons name="brain" size={size} color={color} />,
  },
];

type ClientConfig = {
  intakeEnabled: boolean;
  reqGoals: boolean;
  reqInjuries: boolean;
  reqHistory: boolean;
  reqEquip: boolean;
  customQuestions: string;
  strictMode: boolean;
  redFlagKeywords: string;
  medicalDisclaimer: string;
  tone: string;
  communicationStyle: string;
  fallbackEquipment: string;
  fallbackMissedWorkout: string;
  morningCheckIn: boolean;
  morningTime: string;
  morningSleep: boolean;
  morningSoreness: boolean;
  morningMood: boolean;
  eveningRecap: boolean;
  eveningTime: string;
  reflectionQuestions: string;
  stepCount: boolean;
  hydration: boolean;
  proteinTarget: boolean;
  sleepHours: boolean;
  nudgeFrequency: 'low' | 'medium' | 'high';
  photoLogging: boolean;
  trackingPhilosophy: 'macro' | 'hand' | 'intuitive';
  feedbackStyle: string;
  splitPreference: string;
  progressionModel: string;
  videoFormAnalysis: boolean;
  keyMovements: string;
  injuryAutoAdjustment: boolean;
  factCheck: boolean;
  trustedSources: string;
  educationWeek1: boolean;
  educationWeek3: boolean;
  educationWeek5: boolean;
};

type ToggleKey = {
  [Key in keyof ClientConfig]: ClientConfig[Key] extends boolean ? Key : never;
}[keyof ClientConfig];

const DEFAULT_CONFIG: ClientConfig = {
  intakeEnabled: true,
  reqGoals: true,
  reqInjuries: true,
  reqHistory: true,
  reqEquip: true,
  customQuestions: '',
  strictMode: true,
  redFlagKeywords:
    'chest pain, sharp pain, dizziness, fainting, broken bone, surgery, pregnant',
  medicalDisclaimer:
    'I am an AI fitness assistant, not a doctor. Please consult with a healthcare professional regarding this symptom.',
  tone: 'Encouraging but firm',
  communicationStyle: 'Concise, uses emojis sparingly',
  fallbackEquipment:
    "No worries! Let's swap that for a bodyweight alternative. Try doing...",
  fallbackMissedWorkout:
    "Life happens. Let's adjust the schedule. Can you do a shorter session tomorrow?",
  morningCheckIn: true,
  morningTime: '07:00',
  morningSleep: true,
  morningSoreness: true,
  morningMood: true,
  eveningRecap: true,
  eveningTime: '20:00',
  reflectionQuestions: 'What went well today? What was challenging?',
  stepCount: true,
  hydration: false,
  proteinTarget: true,
  sleepHours: true,
  nudgeFrequency: 'low',
  photoLogging: true,
  trackingPhilosophy: 'macro',
  feedbackStyle:
    'Focus on protein intake first. Be gentle about occasional treats but firm on total daily calories.',
  splitPreference: 'Upper/Lower Split',
  progressionModel: 'Linear Progression + RPE',
  videoFormAnalysis: true,
  keyMovements: 'Squat depth, Neutral spine in deadlift, Elbow flare in bench press',
  injuryAutoAdjustment: true,
  factCheck: true,
  trustedSources:
    'PubMed, Examine.com, ISSN Position Papers, Renaissance Periodization',
  educationWeek1: true,
  educationWeek3: true,
  educationWeek5: true,
};

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 960;
  const showSideTabs = width >= 720;
  const [activeView, setActiveView] = useState('clients');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('intake');
  const [clientConfigs, setClientConfigs] = useState<Record<string, ClientConfig>>({});

  const currentConfig = selectedClient
    ? clientConfigs[selectedClient.id] ?? DEFAULT_CONFIG
    : DEFAULT_CONFIG;

  const updateConfig = <Key extends keyof ClientConfig>(
    key: Key,
    value: ClientConfig[Key]
  ) => {
    if (!selectedClient) return;
    setClientConfigs((prev) => ({
      ...prev,
      [selectedClient.id]: {
        ...DEFAULT_CONFIG,
        ...prev[selectedClient.id],
        [key]: value,
      },
    }));
  };

  const updateToggle = (key: ToggleKey) => (value: boolean) => {
    updateConfig(key, value);
  };

  const contentWidth = Math.max(width - (isWide ? SIDEBAR_WIDTH : 0) - 32, 280);
  const columns = contentWidth >= 960 ? 3 : contentWidth >= 720 ? 2 : 1;
  const cardGap = 16;
  const cardWidth = Math.max(
    260,
    Math.floor((contentWidth - cardGap * (columns - 1)) / columns)
  );

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setSelectedClient(null);
  };

  const scrollPaddingBottom = selectedClient && !showSideTabs ? 120 : 32;

  const renderBilling = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.pageTitle}>Billing & Plans</Text>
        <Text style={styles.pageSubtitle}>Manage your subscription and client billing</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Current Plan</Text>
          <Text style={styles.cardDescription}>You are on the Professional Plan</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.planRow}>
            <View>
              <Text style={styles.bodyText}>Professional Plan</Text>
              <Text style={styles.mutedText}>$99/month</Text>
            </View>
            <OutlineButton label="Manage Subscription" />
          </View>
          <View style={styles.metricsGrid}>
            <MetricBlock label="Active Clients" value="12/20" />
            <MetricBlock label="Next Billing Date" value="Dec 1, 2025" />
            <MetricBlock label="Est. Revenue" value="$2,400" />
          </View>
        </View>
      </View>
    </View>
  );

  const renderSupport = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.pageTitle}>Support</Text>
        <Text style={styles.pageSubtitle}>Get help with your dashboard</Text>
      </View>

      <View style={[styles.splitGrid, isWide && styles.splitGridRow]}>
        <View style={[styles.card, isWide && styles.splitGridCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Contact Support</Text>
            <Text style={styles.cardDescription}>Need help? Reach out to our team.</Text>
          </View>
          <View style={styles.cardContent}>
            <Field label="Subject">
              <FormInput placeholder="What do you need help with?" />
            </Field>
            <Field label="Message">
              <FormInput placeholder="Describe your issue..." multiline />
            </Field>
            <PrimaryButton label="Send Message" fullWidth style={styles.buttonSpacing} />
          </View>
        </View>

        <View style={[styles.card, isWide && styles.splitGridCardLast]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Documentation</Text>
            <Text style={styles.cardDescription}>Learn how to use the platform.</Text>
          </View>
          <View style={styles.cardContent}>
            <OutlineButton label="Getting Started Guide" fullWidth align="left" style={styles.buttonSpacing} />
            <OutlineButton label="Configuring AI Agents" fullWidth align="left" style={styles.buttonSpacing} />
            <OutlineButton label="Managing Client Billing" fullWidth align="left" style={styles.buttonSpacing} />
            <OutlineButton label="API Documentation" fullWidth align="left" style={styles.buttonSpacing} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderClientList = () => (
    <View>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeader}>
          <Text style={styles.pageTitle}>Client Management</Text>
          <Text style={styles.pageSubtitle}>Manage client programs and AI configurations</Text>
        </View>
        <View style={!isWide ? styles.sectionHeaderAction : null}>
          <PrimaryButton
            label="Add New Client"
            icon={<Feather name="plus" size={16} color={palette.white} />}
          />
        </View>
      </View>

      <View style={styles.clientsGrid}>
        {MOCK_CLIENTS.map((client, index) => (
          <ClientCard
            key={client.id}
            client={client}
            onSelect={setSelectedClient}
            style={[
              { width: cardWidth },
              (index + 1) % columns !== 0 && { marginRight: cardGap },
              { marginBottom: cardGap },
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderClientDetail = (client: Client) => (
    <View>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.clientHeader}>
          <Pressable style={styles.iconCircle} onPress={() => setSelectedClient(null)}>
            <Feather name="arrow-left" size={20} color={palette.slate700} />
          </Pressable>
          <View>
            <Text style={styles.pageTitle}>{client.name}</Text>
            <Text style={styles.pageSubtitle}>Agent Configuration • {client.program}</Text>
          </View>
        </View>
        <View style={!isWide ? styles.sectionHeaderAction : null}>
          <PrimaryButton
            label="Save Changes"
            icon={<Feather name="save" size={16} color={palette.white} />}
          />
        </View>
      </View>

      <View style={styles.tabsLayout}>
        {showSideTabs && (
          <View style={styles.tabsSidebar}>
            {CLIENT_TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  onPress={() => setActiveTab(tab.value)}
                  style={({ pressed }) => [
                    styles.tabButton,
                    isActive && styles.tabButtonActive,
                    pressed && !isActive && styles.tabButtonPressed,
                  ]}
                >
                  {tab.icon({
                    color: isActive ? palette.slate900 : palette.slate500,
                    size: 16,
                  })}
                  <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.tabContent}>{renderTabContent()}</View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'intake':
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Deep Intake Interview</Text>
              <Text style={styles.cardDescription}>
                Configure how the agent interviews new clients and gathers initial data.
              </Text>
            </View>
            <View style={styles.cardContent}>
              <ToggleRow
                label="Enable Intake Interview"
                description="Automatically start interview for new users"
                value={currentConfig.intakeEnabled}
                onValueChange={updateToggle('intakeEnabled')}
              />
              <Field label="Required Data Points">
                <View style={styles.toggleGrid}>
                  <ToggleChip
                    label="Fitness Goals"
                    value={currentConfig.reqGoals}
                    onValueChange={updateToggle('reqGoals')}
                  />
                  <ToggleChip
                    label="Injury History"
                    value={currentConfig.reqInjuries}
                    onValueChange={updateToggle('reqInjuries')}
                  />
                  <ToggleChip
                    label="Training History"
                    value={currentConfig.reqHistory}
                    onValueChange={updateToggle('reqHistory')}
                  />
                  <ToggleChip
                    label="Available Equipment"
                    value={currentConfig.reqEquip}
                    onValueChange={updateToggle('reqEquip')}
                  />
                </View>
              </Field>
              <Field label="Custom Questions">
                <FormInput
                  placeholder="Add specific questions you want the agent to ask every new client..."
                  multiline
                  value={currentConfig.customQuestions}
                  onChangeText={(value) => updateConfig('customQuestions', value)}
                />
              </Field>
            </View>
          </View>
        );
      case 'safety':
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Risk & Scope Guardrails</Text>
              <Text style={styles.cardDescription}>
                Set boundaries for when the agent should defer to medical professionals.
              </Text>
            </View>
            <View style={styles.cardContent}>
              <ToggleRow
                label="Strict Medical Guardrails"
                description="Aggressively flag any medical keywords"
                value={currentConfig.strictMode}
                onValueChange={updateToggle('strictMode')}
              />
              <Field label="Red Flag Keywords">
                <FormInput
                  multiline
                  value={currentConfig.redFlagKeywords}
                  onChangeText={(value) => updateConfig('redFlagKeywords', value)}
                />
                <Text style={styles.helperText}>
                  Comma separated list of terms that trigger the medical disclaimer.
                </Text>
              </Field>
              <Field label="Medical Disclaimer Message">
                <FormInput
                  multiline
                  value={currentConfig.medicalDisclaimer}
                  onChangeText={(value) => updateConfig('medicalDisclaimer', value)}
                />
              </Field>
            </View>
          </View>
        );
      case 'chat':
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Trainer Clone Personality</Text>
              <Text style={styles.cardDescription}>
                Customize the voice and tone of your AI clone.
              </Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.twoColumn}>
                <Field label="Tone" style={styles.twoColumnItem}>
                  <FormInput
                    value={currentConfig.tone}
                    onChangeText={(value) => updateConfig('tone', value)}
                  />
                </Field>
                <Field label="Communication Style" style={styles.twoColumnItem}>
                  <FormInput
                    value={currentConfig.communicationStyle}
                    onChangeText={(value) => updateConfig('communicationStyle', value)}
                  />
                </Field>
              </View>
              <Field label="Fallback Templates">
                <Field label="Equipment Unavailable" small>
                  <FormInput
                    multiline
                    value={currentConfig.fallbackEquipment}
                    onChangeText={(value) => updateConfig('fallbackEquipment', value)}
                  />
                </Field>
                <Field label="Missed Workout" small>
                  <FormInput
                    multiline
                    value={currentConfig.fallbackMissedWorkout}
                    onChangeText={(value) => updateConfig('fallbackMissedWorkout', value)}
                  />
                </Field>
              </Field>
            </View>
          </View>
        );
      case 'rituals':
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily Rituals</Text>
              <Text style={styles.cardDescription}>
                Configure automated morning and evening check-ins.
              </Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.sectionBlock}>
                <ToggleRow
                  label="Morning Check-in"
                  value={currentConfig.morningCheckIn}
                  onValueChange={updateToggle('morningCheckIn')}
                />
                <View style={styles.indented}>
                  <Field label="Time" small>
                    <FormInput
                      value={currentConfig.morningTime}
                      onChangeText={(value) => updateConfig('morningTime', value)}
                    />
                  </Field>
                  <Field label="Metrics to Track" small>
                    <View style={styles.checkGrid}>
                      <CheckItem
                        label="Sleep"
                        checked={currentConfig.morningSleep}
                        onPress={() =>
                          updateConfig('morningSleep', !currentConfig.morningSleep)
                        }
                      />
                      <CheckItem
                        label="Soreness"
                        checked={currentConfig.morningSoreness}
                        onPress={() =>
                          updateConfig('morningSoreness', !currentConfig.morningSoreness)
                        }
                      />
                      <CheckItem
                        label="Mood"
                        checked={currentConfig.morningMood}
                        onPress={() => updateConfig('morningMood', !currentConfig.morningMood)}
                      />
                    </View>
                  </Field>
                </View>
              </View>
              <View style={[styles.sectionBlock, styles.sectionDivider]}>
                <ToggleRow
                  label="Evening Recap"
                  value={currentConfig.eveningRecap}
                  onValueChange={updateToggle('eveningRecap')}
                />
                <View style={styles.indented}>
                  <Field label="Time" small>
                    <FormInput
                      value={currentConfig.eveningTime}
                      onChangeText={(value) => updateConfig('eveningTime', value)}
                    />
                  </Field>
                  <Field label="Reflection Questions" small>
                    <FormInput
                      multiline
                      value={currentConfig.reflectionQuestions}
                      onChangeText={(value) => updateConfig('reflectionQuestions', value)}
                    />
                  </Field>
                </View>
              </View>
            </View>
          </View>
        );
      case 'habits':
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Habits & Gamification</Text>
              <Text style={styles.cardDescription}>
                Set up tracking for daily habits and streak logic.
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Field label="Active Trackers">
                <View style={styles.toggleGrid}>
                  <ToggleCard
                    label="Step Count"
                    value={currentConfig.stepCount}
                    onValueChange={updateToggle('stepCount')}
                  />
                  <ToggleCard
                    label="Hydration"
                    value={currentConfig.hydration}
                    onValueChange={updateToggle('hydration')}
                  />
                  <ToggleCard
                    label="Protein Target"
                    value={currentConfig.proteinTarget}
                    onValueChange={updateToggle('proteinTarget')}
                  />
                  <ToggleCard
                    label="Sleep Hours"
                    value={currentConfig.sleepHours}
                    onValueChange={updateToggle('sleepHours')}
                  />
                </View>
              </Field>
              <Field label="Nudge Frequency">
                <View style={styles.optionGroup}>
                  <OptionButton
                    label="Low (Only when critical)"
                    selected={currentConfig.nudgeFrequency === 'low'}
                    onPress={() => updateConfig('nudgeFrequency', 'low')}
                  />
                  <OptionButton
                    label="Medium (Daily reminders)"
                    selected={currentConfig.nudgeFrequency === 'medium'}
                    onPress={() => updateConfig('nudgeFrequency', 'medium')}
                  />
                  <OptionButton
                    label="High (Multiple times a day)"
                    selected={currentConfig.nudgeFrequency === 'high'}
                    onPress={() => updateConfig('nudgeFrequency', 'high')}
                  />
                </View>
              </Field>
            </View>
          </View>
        );
      case 'nutrition':
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Nutrition & Analysis</Text>
              <Text style={styles.cardDescription}>
                Configure food recognition and dietary counseling.
              </Text>
            </View>
            <View style={styles.cardContent}>
              <ToggleRow
                label="Photo Meal Logging"
                description="Allow clients to log meals by sending photos"
                value={currentConfig.photoLogging}
                onValueChange={updateToggle('photoLogging')}
              />
              <Field label="Tracking Philosophy">
                <View style={styles.optionGroup}>
                  <RadioOption
                    label="Strict Macro Counting"
                    selected={currentConfig.trackingPhilosophy === 'macro'}
                    onPress={() => updateConfig('trackingPhilosophy', 'macro')}
                  />
                  <RadioOption
                    label="Hand Portions / Estimations"
                    selected={currentConfig.trackingPhilosophy === 'hand'}
                    onPress={() => updateConfig('trackingPhilosophy', 'hand')}
                  />
                  <RadioOption
                    label="Intuitive Eating / Adherence Only"
                    selected={currentConfig.trackingPhilosophy === 'intuitive'}
                    onPress={() => updateConfig('trackingPhilosophy', 'intuitive')}
                  />
                </View>
              </Field>
              <Field label="Feedback Style">
                <FormInput
                  multiline
                  value={currentConfig.feedbackStyle}
                  onChangeText={(value) => updateConfig('feedbackStyle', value)}
                />
              </Field>
            </View>
          </View>
        );
      case 'training':
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Training & Form Analysis</Text>
              <Text style={styles.cardDescription}>
                Manage workout generation and video analysis settings.
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Field label="Program Generation Style">
                <View style={styles.twoColumn}>
                  <Field label="Split Preference" small style={styles.twoColumnItem}>
                    <FormInput
                      value={currentConfig.splitPreference}
                      onChangeText={(value) => updateConfig('splitPreference', value)}
                    />
                  </Field>
                  <Field label="Progression Model" small style={styles.twoColumnItem}>
                    <FormInput
                      value={currentConfig.progressionModel}
                      onChangeText={(value) => updateConfig('progressionModel', value)}
                    />
                  </Field>
                </View>
              </Field>
              <View style={styles.sectionDivider}>
                <ToggleRow
                  label="Video Form Analysis"
                  value={currentConfig.videoFormAnalysis}
                  onValueChange={updateToggle('videoFormAnalysis')}
                />
                <View style={styles.indented}>
                  <Field label="Key Movements to Watch" small>
                    <FormInput
                      multiline
                      value={currentConfig.keyMovements}
                      onChangeText={(value) => updateConfig('keyMovements', value)}
                    />
                  </Field>
                </View>
              </View>
              <View style={styles.sectionDivider}>
                <ToggleRow
                  label="Injury Auto-Adjustment"
                  value={currentConfig.injuryAutoAdjustment}
                  onValueChange={updateToggle('injuryAutoAdjustment')}
                />
                <Text style={styles.helperText}>
                  Automatically suggest regression exercises when pain is reported.
                </Text>
              </View>
            </View>
          </View>
        );
      case 'education':
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Education & Science</Text>
              <Text style={styles.cardDescription}>
                Configure the knowledge base and educational content delivery.
              </Text>
            </View>
            <View style={styles.cardContent}>
              <ToggleRow
                label="Auto-Fact Checking"
                description="Debunk myths using trusted sources"
                value={currentConfig.factCheck}
                onValueChange={updateToggle('factCheck')}
              />
              <Field label="Trusted Sources">
                <FormInput
                  multiline
                  value={currentConfig.trustedSources}
                  onChangeText={(value) => updateConfig('trustedSources', value)}
                />
              </Field>
              <Field label="Educational Drip Campaign">
                <View style={styles.campaignList}>
                  <ToggleRow
                    label="Week 1-2: Progressive Overload Basics"
                    value={currentConfig.educationWeek1}
                    onValueChange={updateToggle('educationWeek1')}
                    compact
                  />
                  <ToggleRow
                    label="Week 3-4: Nutrition & Macros 101"
                    value={currentConfig.educationWeek3}
                    onValueChange={updateToggle('educationWeek3')}
                    compact
                  />
                  <ToggleRow
                    label="Week 5+: Recovery & Sleep Hygiene"
                    value={currentConfig.educationWeek5}
                    onValueChange={updateToggle('educationWeek5')}
                    compact
                  />
                </View>
              </Field>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const content = useMemo(() => {
    if (activeView === 'billing') return renderBilling();
    if (activeView === 'support') return renderSupport();
    if (selectedClient) return renderClientDetail(selectedClient);
    return renderClientList();
  }, [activeView, selectedClient, activeTab, clientConfigs, width]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.root, isWide && styles.rootWide]}>
        {isWide && <Sidebar activeView={activeView} onViewChange={handleViewChange} />}
        <View style={styles.main}>
          {!isWide && <MobileNav activeView={activeView} onViewChange={handleViewChange} />}
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: scrollPaddingBottom },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
          {!showSideTabs && selectedClient && (
            <View style={styles.mobileTabsBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mobileTabsContent}
              >
                {CLIENT_TABS.map((tab) => {
                  const isActive = activeTab === tab.value;
                  return (
                    <Pressable
                      key={tab.value}
                      onPress={() => setActiveTab(tab.value)}
                      style={({ pressed }) => [
                        styles.mobileTabItem,
                        isActive && styles.mobileTabItemActive,
                        pressed && !isActive && styles.mobileTabItemPressed,
                      ]}
                    >
                      {tab.icon({
                        color: isActive ? palette.slate900 : palette.slate500,
                        size: 16,
                      })}
                      <Text
                        style={[styles.mobileTabText, isActive && styles.mobileTabTextActive]}
                      >
                        {tab.shortLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function Field({
  label,
  children,
  small = false,
  style,
}: {
  label: string;
  children: React.ReactNode;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.field, small && styles.fieldSmall, style]}>
      <Text style={[styles.label, small && styles.labelSmall]}>{label}</Text>
      {children}
    </View>
  );
}

function FormInput(props: React.ComponentProps<typeof TextInput>) {
  const { style, multiline, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={palette.slate400}
      multiline={multiline}
      style={[styles.input, multiline && styles.textarea, style]}
      {...rest}
    />
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  compact = false,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, compact && styles.toggleRowCompact]}>
      <View style={styles.toggleText}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.helperText}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.slate200, true: palette.slate900 }}
        thumbColor={palette.white}
      />
    </View>
  );
}

function ToggleChip({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [
        styles.toggleChip,
        value && styles.toggleChipActive,
        pressed && !value && styles.toggleChipPressed,
      ]}
    >
      <Text style={[styles.toggleChipText, value && styles.toggleChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ToggleCard({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleCard}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.slate200, true: palette.slate900 }}
        thumbColor={palette.white}
      />
    </View>
  );
}

function CheckItem({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.checkItem, pressed && styles.checkItemPressed]}
    >
      <View style={[styles.checkBox, checked && styles.checkBoxChecked]}>
        {checked && <Feather name="check" size={12} color={palette.white} />}
      </View>
      <Text style={styles.checkText}>{label}</Text>
    </Pressable>
  );
}

function OptionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionButton,
        selected && styles.optionButtonActive,
        pressed && !selected && styles.optionButtonPressed,
      ]}
    >
      <Text style={[styles.optionText, selected && styles.optionTextActive]}>{label}</Text>
    </Pressable>
  );
}

function RadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.radioOption}>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.optionText}>{label}</Text>
    </Pressable>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBlock}>
      <Text style={styles.mutedText}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function PrimaryButton({
  label,
  icon,
  fullWidth = false,
  onPress,
  style,
}: {
  label: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        fullWidth && styles.fullWidthButton,
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      {icon ? <View style={styles.buttonIcon}>{icon}</View> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function OutlineButton({
  label,
  fullWidth = false,
  align = 'center',
  onPress,
  style,
}: {
  label: string;
  fullWidth?: boolean;
  align?: 'center' | 'left';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outlineButton,
        fullWidth && styles.fullWidthButton,
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={[styles.outlineButtonText, align === 'left' && styles.outlineButtonTextLeft]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.slate50,
  },
  root: {
    flex: 1,
    backgroundColor: palette.slate50,
  },
  rootWide: {
    flexDirection: 'row',
  },
  main: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.slate900,
  },
  pageSubtitle: {
    fontSize: 13,
    color: palette.slate500,
    marginTop: 4,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.slate200,
    marginBottom: 20,
    shadowColor: palette.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.slate900,
  },
  cardDescription: {
    fontSize: 12,
    color: palette.slate500,
    marginTop: 6,
  },
  cardContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  bodyText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.slate900,
  },
  mutedText: {
    fontSize: 12,
    color: palette.slate500,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.slate900,
    marginTop: 6,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.slate50,
    borderRadius: 14,
    padding: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  metricBlock: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderColor: palette.slate200,
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    marginBottom: 12,
  },
  splitGrid: {
    flexDirection: 'column',
  },
  splitGridRow: {
    flexDirection: 'row',
  },
  splitGridCard: {
    flex: 1,
    marginRight: 16,
  },
  splitGridCardLast: {
    flex: 1,
    marginRight: 0,
  },
  field: {
    marginTop: 16,
  },
  fieldSmall: {
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.slate700,
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 12,
  },
  helperText: {
    fontSize: 11,
    color: palette.slate500,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.slate200,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: palette.slate900,
    backgroundColor: palette.white,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: palette.slate900,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: palette.white,
    fontWeight: '600',
    fontSize: 13,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: palette.slate200,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: palette.slate700,
    fontSize: 13,
    fontWeight: '500',
  },
  outlineButtonTextLeft: {
    textAlign: 'left',
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonSpacing: {
    marginTop: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  fullWidthButton: {
    alignSelf: 'stretch',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionHeaderAction: {
    marginTop: 12,
  },
  clientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: palette.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tabsLayout: {
    flexDirection: 'row',
  },
  tabsSidebar: {
    width: 220,
    marginRight: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.slate200,
  },
  tabButtonActive: {
    backgroundColor: palette.slate100,
    borderColor: palette.slate100,
  },
  tabButtonPressed: {
    backgroundColor: palette.slate50,
  },
  tabButtonText: {
    marginLeft: 10,
    fontSize: 12,
    color: palette.slate600,
    flexShrink: 1,
  },
  tabButtonTextActive: {
    color: palette.slate900,
  },
  tabContent: {
    flex: 1,
  },
  mobileTabsBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: palette.slate200,
    backgroundColor: palette.white,
  },
  mobileTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mobileTabItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  mobileTabItemActive: {
    backgroundColor: palette.slate100,
  },
  mobileTabItemPressed: {
    backgroundColor: palette.slate50,
  },
  mobileTabText: {
    fontSize: 11,
    color: palette.slate500,
    marginTop: 4,
  },
  mobileTabTextActive: {
    color: palette.slate900,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  toggleRowCompact: {
    marginTop: 8,
  },
  toggleText: {
    flex: 1,
    marginRight: 12,
  },
  toggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toggleChip: {
    borderWidth: 1,
    borderColor: palette.slate200,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  toggleChipActive: {
    borderColor: palette.slate900,
    backgroundColor: palette.slate900,
  },
  toggleChipPressed: {
    backgroundColor: palette.slate50,
  },
  toggleChipText: {
    fontSize: 12,
    color: palette.slate600,
  },
  toggleChipTextActive: {
    color: palette.white,
  },
  sectionBlock: {
    marginTop: 12,
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: palette.slate200,
    marginTop: 16,
    paddingTop: 16,
  },
  indented: {
    paddingLeft: 16,
  },
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  checkItemPressed: {
    opacity: 0.7,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: palette.slate300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkBoxChecked: {
    backgroundColor: palette.slate900,
    borderColor: palette.slate900,
  },
  checkText: {
    fontSize: 12,
    color: palette.slate600,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: palette.slate200,
    borderRadius: 14,
    padding: 12,
    minWidth: 160,
    marginRight: 10,
    marginBottom: 10,
  },
  optionGroup: {},
  optionButton: {
    borderWidth: 1,
    borderColor: palette.slate200,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  optionButtonActive: {
    borderColor: palette.slate900,
    backgroundColor: palette.slate100,
  },
  optionButtonPressed: {
    backgroundColor: palette.slate50,
  },
  optionText: {
    fontSize: 12,
    color: palette.slate700,
  },
  optionTextActive: {
    color: palette.slate900,
    fontWeight: '600',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: palette.slate300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterActive: {
    borderColor: palette.slate900,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.slate900,
  },
  twoColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  twoColumnItem: {
    flex: 1,
    minWidth: 160,
    marginRight: 12,
    marginBottom: 12,
  },
  campaignList: {
    borderWidth: 1,
    borderColor: palette.slate200,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
