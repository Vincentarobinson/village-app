import * as React from "react";
import { View, ScrollView, Image, StyleSheet, useWindowDimensions } from "react-native";
import { C } from "../lib/theme";

/* Swipeable, paged photo gallery with dot indicators. */
export function PhotoGallery({ photos, height = 360, borderRadius = 24 }) {
  const { width } = useWindowDimensions();
  const w = width - 36; // screen padding
  const [page, setPage] = React.useState(0);

  if (!photos || photos.length === 0) return null;

  return (
    <View style={{ borderRadius, overflow: "hidden" }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / w))
        }
      >
        {photos.map((url, i) => (
          <Image
            key={`${url}-${i}`}
            source={{ uri: url }}
            style={{ width: w, height }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      {photos.length > 1 && (
        <View style={styles.dots}>
          {photos.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === page ? "#fff" : "rgba(255,255,255,0.45)" },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
