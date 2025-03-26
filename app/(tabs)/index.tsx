import EditScreenInfo from "@/components/EditScreenInfo";
import { Audio } from "expo-av";
import { Text, View } from "@/components/Themed";
import { TouchableOpacity } from "react-native";
import { colors } from "@/constants/Colors";
import { useState, useEffect } from "react";

export default function TabOneScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState({
    positionMillis: 0, // Current time
    durationMillis: 0, // Duration
  });

  useEffect(() => {
    async function setupAudio() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
      });
    }
    setupAudio();
  }, []);

  //Function to switch between play and pause
  async function toggleSound() {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        if (playbackStatus.positionMillis === playbackStatus.durationMillis) {
          // If the song is finished, we start over from the beginning.
          await sound.playFromPositionAsync(0);
        } else {
          // If the song is not finished, continue playing from the current position
          await sound.playAsync();
        }
        setIsPlaying(true);
      }
    } else {
      // Create a new sound if there is no active one
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../../assets/audio/relaxing.mp3"),
        {},
        onPlaybackStatusUpdate // Registering the playback status
      );
      setSound(newSound);

      await newSound.playAsync();
      setIsPlaying(true);
    }
  }

  // Update playback status
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackStatus({
        positionMillis: status.positionMillis || 0,
        durationMillis: status.durationMillis || 0,
      });

      // Checking if playback is complete
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackStatus({
          positionMillis: status.positionMillis || 0, // Reset current position
          durationMillis: status.durationMillis || 0, // leave the duration unchanged
        });
      }
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Text style={{ color: colors.light.text2 }} className="text-2xl">
        Hello
      </Text>
      <Text className="text-2xl text-blue-700 font-bold">
        Welcome to Tailwind
      </Text>
      <Text className="text-lg">
        {Math.floor(playbackStatus.positionMillis / 1000)} /{" "}
        {Math.floor(playbackStatus.durationMillis / 1000)} seconds
      </Text>
      <TouchableOpacity
        onPress={toggleSound}
        className="bg-blue-500 p-4 mt-4 rounded-lg"
      >
        <Text className="text-white text-lg">
          {isPlaying ? "⏸ Stop playing" : "▶️ Play music"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
