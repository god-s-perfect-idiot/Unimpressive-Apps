import { generateWidgetHTML } from "@/services/gemini";
import { createDataURI, generateHTMLForIframe } from "@/services/htmlGenerator";
import { generateWidgetName } from "@/services/nameGenerator";
import { getWidget, saveWidget } from "@/services/widgetStorage";
import { AspectRatio, Widget } from "@/types/widget";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { WebView } from "react-native-webview";

export default function WidgetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const { width: screenWidth } = useWindowDimensions();

  const [widget, setWidget] = useState<Widget | null>(null);
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1x1");
  const [html, setHtml] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const loadWidget = useCallback(async () => {
    if (!id) return;
    const loadedWidget = await getWidget(id);
    if (loadedWidget) {
      setWidget(loadedWidget);
      setName(loadedWidget.name || "Untitled Widget");
      setPrompt(loadedWidget.prompt);
      setAspectRatio(loadedWidget.aspectRatio);
      setHtml(loadedWidget.html);
    } else {
      Alert.alert("Error", "Widget not found");
      router.back();
    }
  }, [id, router]);

  useEffect(() => {
    if (isNew) {
      setWidget({
        id: Date.now().toString(),
        name: "Untitled Widget",
        prompt: "",
        html: "",
        aspectRatio: "1x1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setName("Untitled Widget");
      setPrompt("");
      setAspectRatio("1x1");
      setHtml("");
    } else {
      loadWidget();
    }
  }, [isNew, id, loadWidget]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt");
      return;
    }

    setGenerating(true);
    try {
      const generatedHTML = await generateWidgetHTML(prompt, aspectRatio);
      setHtml(generatedHTML);

      // Generate name from prompt if it's still the default or empty
      const generatedName =
        name === "Untitled Widget" || !name.trim()
          ? generateWidgetName(prompt)
          : name;

      if (widget) {
        const updatedWidget: Widget = {
          ...widget,
          name: generatedName,
          prompt,
          html: generatedHTML,
          aspectRatio,
          updatedAt: Date.now(),
        };
        setWidget(updatedWidget);
        setName(generatedName);
        await saveWidget(updatedWidget);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate widget");
    } finally {
      setGenerating(false);
    }
  };

  const handleAspectRatioChange = async (newRatio: AspectRatio) => {
    setAspectRatio(newRatio);

    // If there's an existing prompt and HTML, regenerate with new aspect ratio
    if (prompt.trim() && html) {
      setGenerating(true);
      try {
        const generatedHTML = await generateWidgetHTML(prompt, newRatio);
        setHtml(generatedHTML);

        if (widget) {
          const updatedWidget: Widget = {
            ...widget,
            name: widget.name || generateWidgetName(prompt),
            prompt,
            html: generatedHTML,
            aspectRatio: newRatio,
            updatedAt: Date.now(),
          };
          setWidget(updatedWidget);
          await saveWidget(updatedWidget);
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to regenerate widget");
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setHtml("");
    if (widget) {
      const updatedWidget: Widget = {
        ...widget,
        html: "",
        updatedAt: Date.now(),
      };
      setWidget(updatedWidget);
      saveWidget(updatedWidget);
    }
    setShowResetModal(false);
  };

  const iframeHTML = html ? generateHTMLForIframe(html, aspectRatio) : "";
  const dataURI = iframeHTML ? createDataURI(iframeHTML) : "";

  // Calculate preview dimensions based on aspect ratio
  // Container width: screen width minus padding (24px on each side = 48px total)
  const containerWidth = screenWidth - 48;
  
  // Calculate preview dimensions based on aspect ratio
  // 1x1: half the size of 2x2
  // 2x2: full width (reference size)
  // 2x1: same width as 2x2, same height as 1x1
  const getPreviewDimensions = () => {
    switch (aspectRatio) {
      case '1x1':
        // 1x1 is half the size of 2x2, so width is half of container
        const width1x1 = containerWidth / 2;
        return { width: width1x1, height: width1x1 };
      case '2x1':
        // 2x1 has same width as 2x2, same height as 1x1
        const width2x1 = containerWidth;
        const height2x1 = containerWidth / 2;
        return { width: width2x1, height: height2x1 };
      case '2x2':
        // 2x2 is the reference size (full width, square)
        return { width: containerWidth, height: containerWidth };
      default:
        const defaultWidth = containerWidth / 2;
        return { width: defaultWidth, height: defaultWidth };
    }
  };

  const previewDimensions = getPreviewDimensions();

  return (
    <View className="bg-[#000] flex-1">
      {/* Header with Title */}
      <View className="pt-8 px-6 pb-6 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          className="p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Editable Title */}
        <View className="flex-1 px-4">
          {isEditingName ? (
            <TextInput
              value={name}
              onChangeText={setName}
              onBlur={() => {
                setIsEditingName(false);
                if (widget && name.trim()) {
                  const updatedWidget: Widget = {
                    ...widget,
                    name: name.trim() || "Untitled Widget",
                    updatedAt: Date.now(),
                  };
                  setWidget(updatedWidget);
                  saveWidget(updatedWidget);
                }
              }}
              onSubmitEditing={() => {
                setIsEditingName(false);
                if (widget && name.trim()) {
                  const updatedWidget: Widget = {
                    ...widget,
                    name: name.trim() || "Untitled Widget",
                    updatedAt: Date.now(),
                  };
                  setWidget(updatedWidget);
                  saveWidget(updatedWidget);
                }
              }}
              autoFocus
              className="bg-transparent text-white text-2xl serif text-center"
              placeholder="Widget name"
              placeholderTextColor="#ffffff40"
              maxLength={50}
            />
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditingName(true)}
              className="px-2"
            >
              <Text
                className="text-white text-2xl serif text-center"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {name || "Untitled Widget"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={handleReset} className="p-2 -mr-2">
          <Ionicons name="refresh-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Widget Preview - Large, Prominent */}
        <View className="px-6 mb-10">
          {/* Outer container - fixed size, centered, prevents view shifting */}
          <View 
            className="items-center justify-center"
            style={{
              width: containerWidth,
              minHeight: containerWidth, // Keep minimum height to prevent shifting
              alignSelf: 'center',
            }}
          >
            {generating ? (
              <View 
                className="bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                style={{
                  width: previewDimensions.width,
                  height: previewDimensions.height,
                }}
              >
                <ActivityIndicator size="large" color="#fff" />
                <Text className="text-white/60 mt-6 text-base serif">
                  Generating...
                </Text>
              </View>
            ) : html ? (
              <View 
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/10"
                style={{
                  width: previewDimensions.width,
                  height: previewDimensions.height,
                }}
              >
                {Platform.OS === "web" ? (
                  <iframe
                    src={dataURI}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      backgroundColor: "#fff",
                    }}
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <WebView
                    source={{ uri: dataURI }}
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#fff",
                    }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                  />
                )}
              </View>
            ) : (
              <View 
                className="bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                style={{
                  width: previewDimensions.width,
                  height: previewDimensions.height,
                }}
              >
                <Ionicons name="cube-outline" size={56} color="#ffffff20" />
                <Text className="text-white/40 mt-6 text-base text-center px-8">
                  Enter a prompt below to create your widget
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Aspect Ratio Selector - Clean, Minimal */}
        <View className="px-6 mb-10">
          <View className="flex-row gap-4">
            {(["1x1", "2x1", "2x2"] as AspectRatio[]).map((ratio) => (
              <TouchableOpacity
                key={ratio}
                onPress={() => handleAspectRatioChange(ratio)}
                className={`flex-1 py-4 rounded-xl border ${
                  aspectRatio === ratio
                    ? "border-white bg-white/10"
                    : "border-white/20 bg-transparent"
                }`}
              >
                <Text
                  className={`text-center font-bold text-base roboto ${
                    aspectRatio === ratio ? "text-white" : "text-white/50"
                  }`}
                >
                  {ratio}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prompt Input - Large, Bold */}
        <View className="px-6 mb-8">
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe your widget..."
            placeholderTextColor="#ffffff30"
            multiline
            numberOfLines={5}
            className="bg-white/5 rounded-2xl p-6 text-white text-base min-h-[140px] border border-white/10 roboto"
            textAlignVertical="top"
            editable={!generating}
            style={{ fontSize: 16, lineHeight: 24 }}
          />
        </View>

        {/* Create Button - Large, Bold */}
        <View className="px-6">
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={generating || !prompt.trim()}
            className={`bg-[#FCA326] rounded-full py-2 items-center ${
              generating || !prompt.trim() ? "opacity-40" : ""
            }`}
          >
            {generating ? (
              <ActivityIndicator color="#000" size="large" />
            ) : (
              <Text className="text-black font-bold text-lg roboto">
                Create
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reset Confirmation Modal - Bottom Sheet */}
      {showResetModal && (
        <>
          {/* Backdrop */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowResetModal(false)}
            className="absolute inset-0 bg-black/60"
          />
          {/* Bottom Sheet */}
          <View className="absolute bottom-0 left-0 right-0 bg-black border-t border-white/10">
            <View className="px-6 pt-6 pb-8">
              <Text className="text-white text-2xl serif mb-2">
                Reset Widget?
              </Text>
              <Text className="text-white/60 text-base mb-8 roboto">
                Are you sure you want to reset this widget? This will clear the
                current HTML.
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowResetModal(false)}
                  className="flex-1 bg-white/10 rounded-full py-2 items-center border border-white/20"
                >
                  <Text className="text-white font-semibold text-base roboto">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmReset}
                  className="flex-1 bg-[#FCA326] rounded-full py-2 items-center"
                >
                  <Text className="text-black font-bold text-base roboto">
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
