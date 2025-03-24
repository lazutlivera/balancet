
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import {colors} from '@/constants/Colors';

export default function TabOneScreen() {

  return (
    <View className='flex-1 justify-center items-center'>
      <Text style ={{ color : colors.light.text2}} className='text-2xl'>Hello</Text>
      <Text className='text-2xl text-blue-700 font-bold'>Welcome to Tailwind</Text>
    </View>
  );
}

