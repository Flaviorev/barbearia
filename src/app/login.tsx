import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { login, cadastrar } from "../services/api";

export default function LoginScreen() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const enviar = async () => {
    setMensagem("");
    setCarregando(true);
    try {
      const user = modoCadastro
        ? await cadastrar(nome, email, senha)
        : await login(email, senha);
      setMensagem(`Bem-vindo, ${user.nome}!`);
    } catch (e: any) {
      setMensagem(e.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 80 }}>
      <Text style={{ fontSize: 22, marginBottom: 16 }}>
        {modoCadastro ? "Criar conta" : "Entrar"}
      </Text>

      {modoCadastro && (
        <>
          <Text>Nome</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
          />
        </>
      )}

      <Text>E-mail</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />

      <Text>Senha</Text>
      <TextInput
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />

      <Button
        title={carregando ? "Aguarde..." : modoCadastro ? "Cadastrar" : "Entrar"}
        onPress={enviar}
        disabled={carregando}
      />

      {mensagem !== "" && <Text style={{ marginTop: 12 }}>{mensagem}</Text>}

      <View style={{ marginTop: 20 }}>
        <Button
          title={modoCadastro ? "Já tenho conta" : "Criar conta"}
          onPress={() => {
            setModoCadastro(!modoCadastro);
            setMensagem("");
          }}
        />
      </View>
    </View>
  );
}