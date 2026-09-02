import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  FlatList,
  Modal,
  Image
} from 'react-native';

// API Base URL config for React Native (Physical device / Android Emulator 10.0.2.2 / Localhost)
const API_BASE = 'http://localhost:8000/api/v1';

export const AppNative: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [screen, setScreen] = useState<'SPLASH' | 'WELCOME' | 'LOGIN' | 'MAIN'>('SPLASH');
  const [activeTab, setActiveTab] = useState<'HOME' | 'DIRECTORY' | 'EVENTS' | 'DOCUMENTS' | 'PROFILE'>('HOME');

  // Auth Inputs
  const [identifier, setIdentifier] = useState('alumni@school.edu');
  const [password, setPassword] = useState('123456');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');
  const [loading, setLoading] = useState(false);

  // Live Data States
  const [school, setSchool] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);

  useEffect(() => {
    fetchSchoolInfo();
    const timer = setTimeout(() => {
      setScreen('WELCOME');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const fetchSchoolInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/school/profile`);
      const data = await res.json();
      setSchool(data);
    } catch (e) {
      console.warn('Backend connection check:', e);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password, check_user: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');
      setStep('OTP');
      Alert.alert('OTP Dispatched', 'A 6-digit verification code has been dispatched to your email/mobile.');
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid OTP code');
      setToken(data.access_token);
      await loadBackendData(data.access_token);
      setScreen('MAIN');
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBackendData = async (authToken: string) => {
    const headers = { Authorization: `Bearer ${authToken}` };
    try {
      const [uRes, eRes, dRes, docRes, pRes, mRes] = await Promise.all([
        fetch(`${API_BASE}/auth/me`, { headers }),
        fetch(`${API_BASE}/events`, { headers }),
        fetch(`${API_BASE}/alumni/directory`, { headers }),
        fetch(`${API_BASE}/documents/requests`, { headers }),
        fetch(`${API_BASE}/community/posts`, { headers }),
        fetch(`${API_BASE}/mentorship/mentors`, { headers })
      ]);

      const [uData, eData, dData, docData, pData, mData] = await Promise.all([
        uRes.json(), eRes.json(), dRes.json(), docRes.json(), pRes.json(), mRes.json()
      ]);

      setUserProfile(uData);
      setEvents(Array.isArray(eData) ? eData : []);
      setDirectory(Array.isArray(dData) ? dData : []);
      setDocuments(Array.isArray(docData) ? docData : []);
      setCommunityPosts(Array.isArray(pData) ? pData : []);
      setMentors(Array.isArray(mData) ? mData : []);
    } catch (err) {
      console.error('Failed fetching live backend data:', err);
    }
  };

  // Splash Screen Render
  if (screen === 'SPLASH') {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.logoBadge}>
          <Text style={styles.logoBadgeText}>{school?.code || 'ALU'}</Text>
        </View>
        <Text style={styles.splashTitle}>{school?.name || 'ALUMNI PORTAL'}</Text>
        <Text style={styles.splashSub}>React Native Mobile Network</Text>
        <ActivityIndicator size="large" color="#F4C542" style={{ marginTop: 24 }} />
      </View>
    );
  }

  // Welcome Screen Render
  if (screen === 'WELCOME') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authWrapper}>
          <View style={styles.logoBadgeLarge}>
            <Text style={styles.logoBadgeTextLarge}>{school?.code || 'ALU'}</Text>
          </View>
          <Text style={styles.welcomeHeading}>Welcome, Alumnus</Text>
          <Text style={styles.welcomeSub}>Stay connected with batchmates, reunions, and certificates.</Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => setScreen('LOGIN')}>
            <Text style={styles.primaryBtnText}>Sign In with Email / OTP</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Login Screen Render
  if (screen === 'LOGIN') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authWrapper}>
          <TouchableOpacity onPress={() => setScreen('WELCOME')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.welcomeHeading}>Alumni Sign In</Text>

          {step === 'CREDENTIALS' ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address or Phone *</Text>
              <TextInput
                style={styles.input}
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="name@email.com"
                autoCapitalize="none"
              />
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password"
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleSendOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryBtnText}>Send OTP Code →</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Enter 6-Digit OTP *</Text>
              <TextInput
                style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 6 }]}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryBtnText}>Verify & Sign In</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Main React Native App Navigation & Modules Render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.miniLogo}>
            <Text style={styles.miniLogoText}>{school?.code || 'ALU'}</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{school?.name || 'Alumni App'}</Text>
            <Text style={styles.headerSub}>Class of {userProfile?.passing_year || 'Alumni'}</Text>
          </View>
        </View>
      </View>

      {/* Main Module Viewport */}
      <ScrollView style={styles.content}>
        {activeTab === 'HOME' && (
          <View style={styles.section}>
            <View style={styles.heroCard}>
              <Text style={styles.heroBadge}>Class of {userProfile?.passing_year || 2010}</Text>
              <Text style={styles.heroTitle}>Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Alumnus'}!</Text>
              <Text style={styles.heroSub}>Connected with live FastAPI & MongoDB Backend.</Text>
            </View>

            <Text style={styles.sectionTitle}>Upcoming Reunions ({events.length})</Text>
            {events.map((ev: any) => (
              <View key={ev.id} style={styles.card}>
                <Text style={styles.cardTitle}>{ev.title}</Text>
                <Text style={styles.cardSub}>{ev.event_date} @ {ev.venue}</Text>
                <Text style={styles.cardDesc}>{ev.description}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'DIRECTORY' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Global Alumni Directory ({directory.length})</Text>
            {directory.map((alumnus: any) => (
              <View key={alumnus.id || alumnus.mobile} style={styles.card}>
                <Text style={styles.cardTitle}>{alumnus.full_name}</Text>
                <Text style={styles.cardSub}>Class of {alumnus.passing_year} • {alumnus.profession || 'Alumnus'}</Text>
                <Text style={styles.cardDesc}>{alumnus.current_city || 'Location N/A'}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'DOCUMENTS' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Document Requests ({documents.length})</Text>
            {documents.map((doc: any) => (
              <View key={doc.id} style={styles.card}>
                <Text style={styles.cardTitle}>{doc.doc_type}</Text>
                <Text style={styles.cardSub}>Status: {doc.status}</Text>
                <Text style={styles.cardDesc}>{doc.reason}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'PROFILE' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alumni Profile</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{userProfile?.full_name}</Text>
              <Text style={styles.cardSub}>{userProfile?.email} • {userProfile?.mobile}</Text>
              <Text style={styles.cardDesc}>Passing Year: Class of {userProfile?.passing_year}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('HOME')}>
          <Text style={[styles.navText, activeTab === 'HOME' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('DIRECTORY')}>
          <Text style={[styles.navText, activeTab === 'DIRECTORY' && styles.navTextActive]}>Directory</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('DOCUMENTS')}>
          <Text style={[styles.navText, activeTab === 'DOCUMENTS' && styles.navTextActive]}>Docs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('PROFILE')}>
          <Text style={[styles.navText, activeTab === 'PROFILE' && styles.navTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  splashContainer: { flex: 1, backgroundColor: '#111111', justifyContent: 'center', alignItems: 'center', padding: 24 },
  logoBadge: { width: 80, height: 80, backgroundColor: '#F4C542', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  logoBadgeText: { fontSize: 24, fontWeight: 'bold', color: '#111111' },
  splashTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 16 },
  splashSub: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  authWrapper: { padding: 24, justifyContent: 'center', flex: 1 },
  logoBadgeLarge: { width: 72, height: 72, backgroundColor: '#FFF7D6', borderColor: '#F4C542', borderWidth: 2, borderRadius: 20, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  logoBadgeTextLarge: { fontSize: 20, fontWeight: 'bold', color: '#111111' },
  welcomeHeading: { fontSize: 24, fontWeight: 'bold', color: '#111111', textAlign: 'center' },
  welcomeSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  primaryBtn: { backgroundColor: '#F4C542', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { fontSize: 14, fontWeight: 'bold', color: '#111111' },
  backBtn: { marginBottom: 16 },
  backBtnText: { fontSize: 14, color: '#6B7280', fontWeight: 'bold' },
  formGroup: { marginTop: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#111111', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111111' },
  header: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingHorizontal: 16, paddingVertical: 12 },
  headerBrand: { flexDirection: 'row', alignItems: 'center' },
  miniLogo: { width: 36, height: 36, backgroundColor: '#FFF7D6', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  miniLogoText: { fontSize: 12, fontWeight: 'bold', color: '#111111' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: '#111111' },
  headerSub: { fontSize: 10, color: '#854D0E', fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  heroCard: { backgroundColor: '#111111', borderRadius: 20, padding: 20, marginBottom: 20 },
  heroBadge: { color: '#F4C542', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  heroSub: { color: '#9CA3AF', fontSize: 11, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#111111', marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#111111' },
  cardSub: { fontSize: 11, color: '#854D0E', fontWeight: 'bold', marginTop: 2 },
  cardDesc: { fontSize: 12, color: '#6B7280', marginTop: 6 },
  navBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingVertical: 10 },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { fontSize: 11, color: '#6B7280', fontWeight: 'bold' },
  navTextActive: { color: '#111111' }
});
