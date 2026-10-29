import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// Cast WebView to any to avoid React 19 type discrepancies in third-party definitions
const AppWebView: any = WebView;

// Default Wi-Fi IP of the host machine
const DEFAULT_URL = 'http://172.20.10.2:5173';

export default function AppScreen() {
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [inputUrl, setInputUrl] = useState(DEFAULT_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const webViewRef = useRef<any>(null);

  // Handle Android hardware back button to navigate inside webview
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setCurrentUrl(inputUrl);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Top Floating Control Bar */}
      <View style={styles.topBar}>
        <View style={styles.statusDot} />
        <Text style={styles.urlLabel} numberOfLines={1}>
          {currentUrl}
        </Text>
        <TouchableOpacity
          style={styles.pillButton}
          onPress={() => setShowConfig(!showConfig)}
        >
          <Text style={styles.pillButtonText}>{showConfig ? 'Close' : 'IP Config'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pillButton, styles.reloadButton]}
          onPress={handleRetry}
        >
          <Text style={styles.pillButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Optional IP Configuration Dropdown */}
      {showConfig && (
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Server URL</Text>
          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="http://192.168.x.x:5173"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.configActions}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setShowConfig(false);
                handleRetry();
              }}
            >
              <Text style={styles.applyButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main WebView */}
      <View style={styles.webViewWrapper}>
        <AppWebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          startInLoadingState={true}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onNavigationStateChange={(navState: any) => {
            setCanGoBack(navState.canGoBack);
          }}
          renderLoading={() => (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>Loading Turfington App...</Text>
            </View>
          )}
        />

        {/* Error Fallback Screen */}
        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚡</Text>
            <Text style={styles.errorTitle}>Cannot Connect to Server</Text>
            <Text style={styles.errorDescription}>
              Could not reach <Text style={styles.codeText}>{currentUrl}</Text>
            </Text>

            <View style={styles.troubleshootBox}>
              <Text style={styles.troubleshootItem}>
                1. Make sure <Text style={styles.codeText}>npm run dev</Text> is running on your computer.
              </Text>
              <Text style={styles.troubleshootItem}>
                2. Confirm your phone and PC are on the same Wi-Fi or Hotspot network.
              </Text>
              <Text style={styles.troubleshootItem}>
                3. If your PC IP changed, tap <Text style={styles.boldText}>"IP Config"</Text> at top to update it.
              </Text>
            </View>

            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0e',
  },
  topBar: {
    height: 42,
    backgroundColor: '#121218',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  urlLabel: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  pillButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  reloadButton: {
    paddingHorizontal: 8,
  },
  pillButtonText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  configCard: {
    backgroundColor: '#181822',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  configTitle: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0e0e14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  configActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  webViewWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0b0b0e',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0b0b0e',
  },
  centerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0b0b0e',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0b0b0e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 20,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDescription: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  troubleshootBox: {
    backgroundColor: '#161622',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  troubleshootItem: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  codeText: {
    color: '#a5b4fc',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontWeight: '600',
  },
  boldText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
