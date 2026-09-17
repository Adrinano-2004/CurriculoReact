import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";

// Ordem das cores que se alternam: vermelho -> amarelo -> verde -> vermelho...
const CORES = ["red", "yellow", "green"];

function Luz({ cor, acesa }) {
  return (
    <View
      style={[
        styles.luz,
        { backgroundColor: cor, opacity: acesa ? 1 : 0.25 },
      ]}
    />
  );
}

function SemaforoVertical({ luzAtiva }) {
  return (
    <View style={styles.semaforoVertical}>
      <Luz cor="red" acesa={luzAtiva === 0} />
      <Luz cor="yellow" acesa={luzAtiva === 1} />
      <Luz cor="green" acesa={luzAtiva === 2} />
    </View>
  );
}

function SemaforoHorizontal({ luzAtiva }) {
  return (
    <View style={styles.semaforoHorizontal}>
      <Luz cor="red" acesa={luzAtiva === 0} />
      <Luz cor="yellow" acesa={luzAtiva === 1} />
      <Luz cor="green" acesa={luzAtiva === 2} />
    </View>
  );
}

export default function App() {
  const [luzAtiva, setLuzAtiva] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setLuzAtiva((atual) => (atual + 1) % CORES.length);
    }, 1500);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Desafio Flexbox: Semáforo</Text>

        <Text style={styles.legenda}>Semáforo Vertical</Text>
        <View style={styles.centralizador}>
          <SemaforoVertical luzAtiva={luzAtiva} />
        </View>

        <Text style={styles.legenda}>Semáforo Horizontal</Text>
        <View style={styles.centralizador}>
          <SemaforoHorizontal luzAtiva={luzAtiva} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  titulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  legenda: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 12,
  },
  centralizador: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  semaforoVertical: {
    width: 100,
    height: 260,
    backgroundColor: "#2b2b2b",
    borderRadius: 24,
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    borderWidth: 4,
    borderColor: "#111",
  },
  semaforoHorizontal: {
    width: 260,
    height: 100,
    backgroundColor: "#2b2b2b",
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 4,
    borderColor: "#111",
  },
  luz: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});
