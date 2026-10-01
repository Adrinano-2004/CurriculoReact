import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Switch,
  Pressable,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// frases que aparecem quando as notificacoes estao ligadas
const mensagens = [
  'Lembrete: beba água! 💧',
  'Dica: faça uma pausa rápida ☕',
  'Respire fundo e continue 🙂',
  'Não esqueça de dar commit no projeto!',
  'Já alongou hoje? 🧘',
  'Bora estudar mais um pouco 📚',
];

function CartaoVisita() {
  const [bio, setBio] = useState('');
  const [textoModal, setTextoModal] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const [notificacoes, setNotificacoes] = useState(false);
  const [aviso, setAviso] = useState('');

  // a cada 5 segundos mostra uma mensagem aleatoria, so se o switch estiver ligado
  useEffect(() => {
    if (!notificacoes) {
      setAviso('');
      return;
    }

    const intervalo = setInterval(() => {
      const sorteio = Math.floor(Math.random() * mensagens.length);
      setAviso(mensagens[sorteio]);
    }, 5000);

    // quando desligar o switch o intervalo para
    return () => clearInterval(intervalo);
  }, [notificacoes]);

  function abrirModal() {
    setTextoModal(bio); // ja abre com a bio atual pra facilitar editar
    setModalAberto(true);
  }

  function salvarBio() {
    setBio(textoModal);
    setModalAberto(false);
    Alert.alert('Sucesso', 'Bio atualizada!');
  }

  return (
    <SafeAreaView style={styles.tela}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.conteudo}>
        <Image
          source={{ uri: 'https://github.com/adrinano-2004.png' }}
          style={styles.foto}
        />
        <Text style={styles.nome}>Adriano</Text>

        {/* bio */}
        <View style={styles.card}>
          <Text style={styles.tituloCard}>Bio</Text>
          <View style={styles.caixaBio}>
            <Text style={styles.textoBio}>{bio}</Text>
          </View>

          <Pressable style={styles.botaoPequeno} onPress={abrirModal}>
            <Text style={styles.textoBotao}>Editar Bio</Text>
          </Pressable>
        </View>

        {/* configuracoes */}
        <View style={styles.card}>
          <Text style={styles.tituloCard}>Configurações</Text>
          <View style={styles.linha}>
            <Text>Receber Notificações</Text>
            <Switch value={notificacoes} onValueChange={setNotificacoes} />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.botaoSalvar, pressed && { opacity: 0.7 }]}
          onPress={() => Alert.alert('Salvo', 'Dados salvos com sucesso!')}
        >
          <Text style={styles.textoBotao}>Salvar</Text>
        </Pressable>
      </ScrollView>

      {/* notificacao que aparece embaixo da tela */}
      {aviso !== '' && (
        <View style={styles.notificacao}>
          <Text style={styles.textoNotificacao}>{aviso}</Text>
        </View>
      )}

      <Modal
        visible={modalAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAberto(false)}
      >
        <View style={styles.fundoModal}>
          <View style={styles.caixaModal}>
            <Text style={styles.tituloCard}>Editar Bio</Text>
            <TextInput
              style={styles.input}
              value={textoModal}
              onChangeText={setTextoModal}
              placeholder="Escreva algo sobre você..."
              multiline
            />

            <View style={styles.botoesModal}>
              <Pressable
                style={[styles.botaoPequeno, styles.botaoCancelar]}
                onPress={() => setModalAberto(false)}
              >
                <Text style={{ color: '#333' }}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.botaoPequeno} onPress={salvarBio}>
                <Text style={styles.textoBotao}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CartaoVisita />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  conteudo: {
    padding: 20,
    alignItems: 'center',
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  tituloCard: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  caixaBio: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  textoBio: {
    color: '#555',
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botaoPequeno: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  botaoCancelar: {
    backgroundColor: '#e5e7eb',
    marginRight: 10,
  },
  botaoSalvar: {
    width: '100%',
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notificacao: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoNotificacao: {
    color: '#fff',
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  caixaModal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  botoesModal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
});
