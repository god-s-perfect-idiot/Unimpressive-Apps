import { deleteWidget, getAllWidgets } from "@/services/widgetStorage";
import { Widget } from "@/types/widget";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWidgets = async () => {
    setLoading(true);
    const loadedWidgets = await getAllWidgets();
    setWidgets(loadedWidgets);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadWidgets();
    }, [])
  );

  const handleCreateWidget = () => {
    router.push("/widget/new");
  };

  const handleWidgetPress = (widget: Widget) => {
    router.push(`/widget/${widget.id}`);
  };

  const handleDeleteWidget = async (id: string, e: any) => {
    e.stopPropagation();
    await deleteWidget(id);
    loadWidgets();
  };

  const renderWidgetItem = ({ item }: { item: Widget }) => {
    const preview =
      item.prompt.substring(0, 50) + (item.prompt.length > 50 ? "..." : "");
    const displayName = item.name || "Untitled Widget";

    return (
      <TouchableOpacity
        onPress={() => handleWidgetPress(item)}
        className="rounded-xl py-4 mb-4 flex-row items-center justify-between border-b border-white/10"
        activeOpacity={0.7}
      >
        <View className="flex-1">
          <Text className="text-white text-lg mb-2 mono tracking-tight">
            {displayName}
          </Text>
          <Text className="text-white/60 text-sm mb-3 mono leading-relaxed">
            {preview}
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="bg-white/10 px-3 py-1 rounded-full border border-white/20">
              <Text className="text-white/80 text-xs roboto font-medium">
                {item.aspectRatio}
              </Text>
            </View>
            <Text className="text-white/40 text-xs mono">
              {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => handleDeleteWidget(item.id, e)}
          className="ml-4 p-2 rounded-full bg-[#f00]"
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color="#ffffff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-[#000] flex-1">
      {/* Header - Minimal, Bold Typography */}
      <View className="pt-8 px-6 pb-8">
        <Text className="text-white text-[2.5rem] serif tracking-tight mb-1">
          Unimpressive Apps
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ffffff80" />
          <Text className="text-white/40 text-sm roboto mt-4">Loading...</Text>
        </View>
      ) : (
        <View className="flex-1 px-6 pt-6">
          {widgets.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              {/* Dot Matrix Aesthetic - Grid Pattern */}
              <View className="mb-8">
                <View className="flex-row gap-2 mb-2">
                  <View className="w-2 h-2 bg-white/20 rounded-full" />
                  <View className="w-2 h-2 bg-white/20 rounded-full" />
                  <View className="w-2 h-2 bg-white/20 rounded-full" />
                </View>
                <View className="flex-row gap-2">
                  <View className="w-2 h-2 bg-white/20 rounded-full" />
                  <View className="w-2 h-2 bg-white/40 rounded-full" />
                  <View className="w-2 h-2 bg-white/20 rounded-full" />
                </View>
              </View>
              <Ionicons name="cube-outline" size={48} color="#ffffff30" />
              <Text className="text-white/80 text-center mt-6 text-lg roboto font-semibold">
                No widgets yet
              </Text>
              <Text className="text-white/40 text-center mt-2 text-sm roboto leading-relaxed max-w-xs">
                Create your first widget to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={widgets}
              renderItem={renderWidgetItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Create Button - Minimal, Transparent, Functional */}
      <TouchableOpacity
        onPress={handleCreateWidget}
        className="absolute bottom-8 right-6 bg-white rounded-full w-14 h-14 items-center justify-center border border-white/20"
        activeOpacity={0.7}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="#000" />
      </TouchableOpacity>
    </View>
  );
}
