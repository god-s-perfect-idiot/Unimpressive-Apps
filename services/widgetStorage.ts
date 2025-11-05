import AsyncStorage from '@react-native-async-storage/async-storage';
import { Widget } from '@/types/widget';

const WIDGETS_STORAGE_KEY = '@widgets';

export async function getAllWidgets(): Promise<Widget[]> {
  try {
    const data = await AsyncStorage.getItem(WIDGETS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading widgets:', error);
    return [];
  }
}

export async function saveWidget(widget: Widget): Promise<void> {
  try {
    const widgets = await getAllWidgets();
    const existingIndex = widgets.findIndex((w) => w.id === widget.id);
    
    if (existingIndex >= 0) {
      widgets[existingIndex] = widget;
    } else {
      widgets.push(widget);
    }
    
    await AsyncStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgets));
  } catch (error) {
    console.error('Error saving widget:', error);
    throw error;
  }
}

export async function deleteWidget(id: string): Promise<void> {
  try {
    const widgets = await getAllWidgets();
    const filtered = widgets.filter((w) => w.id !== id);
    await AsyncStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting widget:', error);
    throw error;
  }
}

export async function getWidget(id: string): Promise<Widget | null> {
  try {
    const widgets = await getAllWidgets();
    return widgets.find((w) => w.id === id) || null;
  } catch (error) {
    console.error('Error getting widget:', error);
    return null;
  }
}

