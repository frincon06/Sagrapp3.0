"use client"

import type React from "react"
import { View, StyleSheet } from "react-native"
import HTML from "react-native-render-html"
import { useWindowDimensions } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface RichTextRendererProps {
  content: string
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content }) => {
  const { width } = useWindowDimensions()
  const { isDarkMode, colors } = useTheme()

  const tagsStyles = {
    body: {
      color: isDarkMode ? colors.text : colors.text,
      fontFamily: "System",
    },
    p: {
      marginBottom: 16,
      lineHeight: 24,
    },
    h1: {
      fontSize: 24,
      fontWeight: "bold",
      marginVertical: 16,
      color: isDarkMode ? colors.primary : colors.primary,
    },
    h2: {
      fontSize: 22,
      fontWeight: "bold",
      marginVertical: 14,
      color: isDarkMode ? colors.primary : colors.primary,
    },
    h3: {
      fontSize: 20,
      fontWeight: "bold",
      marginVertical: 12,
      color: isDarkMode ? colors.primary : colors.primary,
    },
    h4: {
      fontSize: 18,
      fontWeight: "bold",
      marginVertical: 10,
      color: isDarkMode ? colors.primary : colors.primary,
    },
    h5: {
      fontSize: 16,
      fontWeight: "bold",
      marginVertical: 8,
      color: isDarkMode ? colors.primary : colors.primary,
    },
    h6: {
      fontSize: 14,
      fontWeight: "bold",
      marginVertical: 6,
      color: isDarkMode ? colors.primary : colors.primary,
    },
    a: {
      color: colors.link,
      textDecorationLine: "underline",
    },
    ul: {
      marginBottom: 16,
    },
    ol: {
      marginBottom: 16,
    },
    li: {
      marginBottom: 8,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      paddingLeft: 16,
      marginLeft: 0,
      marginVertical: 16,
      fontStyle: "italic",
    },
  }

  return (
    <View style={styles.container}>
      <HTML
        source={{ html: content }}
        contentWidth={width - 32}
        tagsStyles={tagsStyles}
        baseStyle={{ color: isDarkMode ? colors.text : colors.text }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
})

export default RichTextRenderer
