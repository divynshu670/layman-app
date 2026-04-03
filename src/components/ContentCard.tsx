import { StyleSheet, Text, View } from 'react-native';

interface Props {
  text: string;
}

export default function ContentCard({ text }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text} numberOfLines={8}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#24170e',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 230,
    justifyContent: 'center',
  },
  text: {
    color: '#fff3ea',
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '500',
  },
});
