import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type Usuario = { id: string; nome: string; email: string };
export type Barbeiro = { id: string; nome: string; horarios: string[] };
export type Agendamento = {
  id: string;
  usuarioId: string;
  barbeiroId: string;
  data: string;
  hora: string;
  status: string;
};

const traduzirErro = (e: any): Error => {
  switch (e?.code) {
    case "auth/email-already-in-use":
      return new Error("E-mail já cadastrado");
    case "auth/invalid-email":
      return new Error("E-mail inválido");
    case "auth/weak-password":
      return new Error("A senha precisa ter pelo menos 6 caracteres");
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return new Error("E-mail ou senha incorretos");
    case "auth/network-request-failed":
      return new Error("Sem conexão com a internet");
    default:
      return new Error(e?.message ?? "Erro inesperado");
  }
};

export const cadastrar = async (
  nome: string,
  email: string,
  senha: string
): Promise<Usuario> => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await setDoc(doc(db, "usuarios", cred.user.uid), { nome, email });
    return { id: cred.user.uid, nome, email };
  } catch (e) {
    throw traduzirErro(e);
  }
};

export const login = async (email: string, senha: string): Promise<Usuario> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const snap = await getDoc(doc(db, "usuarios", cred.user.uid));
    const nome = snap.exists() ? (snap.data().nome as string) : email;
    return { id: cred.user.uid, nome, email };
  } catch (e) {
    throw traduzirErro(e);
  }
};

export const listarBarbeiros = async (): Promise<Barbeiro[]> => {
  const snap = await getDocs(collection(db, "barbeiros"));
  return snap.docs.map((d) => ({
    id: d.id,
    nome: d.data().nome,
    horarios: d.data().horarios ?? [],
  }));
};

export const horariosLivres = async (barbeiroId: string, data: string) => {
  const barbeiroSnap = await getDoc(doc(db, "barbeiros", barbeiroId));
  if (!barbeiroSnap.exists()) throw new Error("Barbeiro não encontrado");
  const horarios: string[] = barbeiroSnap.data().horarios ?? [];

  const q = query(
    collection(db, "agendamentos"),
    where("barbeiroId", "==", barbeiroId),
    where("data", "==", data)
  );
  const ocupados = (await getDocs(q)).docs
    .filter((d) => d.data().status !== "cancelado")
    .map((d) => d.data().hora as string);

  return horarios.filter((h) => !ocupados.includes(h));
};

export const agendar = async (
  usuarioId: string,
  barbeiroId: string,
  data: string,
  hora: string
): Promise<Agendamento> => {
  // ID fixo por barbeiro+data+hora: impede dois clientes no mesmo horário
  const id = `${barbeiroId}_${data}_${hora.replace(":", "")}`;
  const ref = doc(db, "agendamentos", id);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists() && snap.data().status !== "cancelado") {
      throw new Error("Horário indisponível");
    }
    tx.set(ref, { usuarioId, barbeiroId, data, hora, status: "confirmado" });
  });

  return { id, usuarioId, barbeiroId, data, hora, status: "confirmado" };
};

export const meusAgendamentos = async (usuarioId: string): Promise<Agendamento[]> => {
  const q = query(collection(db, "agendamentos"), where("usuarioId", "==", usuarioId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Agendamento, "id">) }))
    .filter((a) => a.status !== "cancelado");
};