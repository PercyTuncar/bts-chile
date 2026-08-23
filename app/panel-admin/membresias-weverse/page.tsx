"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface MembresiaWeverse {
  id: string;
  nombreCliente: string;
  email: string;
  whatsapp: string;
  fechaInicio: Date;
  fechaVencimiento: Date;
  estado: "activa" | "vencida" | "pendiente";
  notas: string;
  creadoEn: Date;
}

export default function MembresiasWeversePage() {
  const [membresias, setMembresias] = useState<MembresiaWeverse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todas" | "activa" | "vencida" | "pendiente">("todas");

  const [formData, setFormData] = useState({
    nombreCliente: "",
    email: "",
    whatsapp: "",
    fechaInicio: "",
    fechaVencimiento: "",
    estado: "pendiente" as "activa" | "vencida" | "pendiente",
    notas: "",
  });

  useEffect(() => {
    cargarMembresias();
  }, []);

  const cargarMembresias = async () => {
    try {
      const q = query(collection(db, "membresiasWeverse"), orderBy("creadoEn", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          nombreCliente: d.nombreCliente,
          email: d.email,
          whatsapp: d.whatsapp,
          fechaInicio: d.fechaInicio?.toDate() || new Date(),
          fechaVencimiento: d.fechaVencimiento?.toDate() || new Date(),
          estado: d.estado,
          notas: d.notas || "",
          creadoEn: d.creadoEn?.toDate() || new Date(),
        };
      });
      setMembresias(data);
    } catch (error) {
      console.error("Error cargando membresías:", error);
      alert("Error al cargar membresías");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombreCliente || !formData.fechaInicio || !formData.fechaVencimiento) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      const data = {
        nombreCliente: formData.nombreCliente,
        email: formData.email,
        whatsapp: formData.whatsapp,
        fechaInicio: Timestamp.fromDate(new Date(formData.fechaInicio)),
        fechaVencimiento: Timestamp.fromDate(new Date(formData.fechaVencimiento)),
        estado: formData.estado,
        notas: formData.notas,
        creadoEn: Timestamp.now(),
      };

      if (editingId) {
        await updateDoc(doc(db, "membresiasWeverse", editingId), data);
        alert("Membresía actualizada");
      } else {
        await addDoc(collection(db, "membresiasWeverse"), data);
        alert("Membresía registrada");
      }

      resetForm();
      cargarMembresias();
      setShowModal(false);
    } catch (error) {
      console.error("Error guardando membresía:", error);
      alert("Error al guardar");
    }
  };

  const handleEdit = (membresia: MembresiaWeverse) => {
    setEditingId(membresia.id);
    setFormData({
      nombreCliente: membresia.nombreCliente,
      email: membresia.email,
      whatsapp: membresia.whatsapp,
      fechaInicio: membresia.fechaInicio.toISOString().split("T")[0],
      fechaVencimiento: membresia.fechaVencimiento.toISOString().split("T")[0],
      estado: membresia.estado,
      notas: membresia.notas,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta membresía?")) return;

    try {
      await deleteDoc(doc(db, "membresiasWeverse", id));
      alert("Membresía eliminada");
      cargarMembresias();
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar");
    }
  };

  const resetForm = () => {
    setFormData({
      nombreCliente: "",
      email: "",
      whatsapp: "",
      fechaInicio: "",
      fechaVencimiento: "",
      estado: "pendiente",
      notas: "",
    });
    setEditingId(null);
  };

  const membresiasFilteradas = membresias.filter((m) => {
    const matchSearch =
      m.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.whatsapp.includes(searchTerm);

    const matchEstado = filtroEstado === "todas" || m.estado === filtroEstado;

    return matchSearch && matchEstado;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-text-muted">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold">Membresías Weverse</h1>
          <p className="text-text-muted">Registro manual de clientes con membresía activa</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand/90"
        >
          <Plus size={20} />
          Agregar Membresía
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-3"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as any)}
          className="rounded-lg border border-border bg-surface px-4 py-3"
        >
          <option value="todas">Todas</option>
          <option value="activa">Activas</option>
          <option value="pendiente">Pendientes</option>
          <option value="vencida">Vencidas</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-2xl font-bold text-green-600">
            {membresias.filter((m) => m.estado === "activa").length}
          </div>
          <div className="text-sm text-text-muted">Activas</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {membresias.filter((m) => m.estado === "pendiente").length}
          </div>
          <div className="text-sm text-text-muted">Pendientes</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-2xl font-bold text-red-600">
            {membresias.filter((m) => m.estado === "vencida").length}
          </div>
          <div className="text-sm text-text-muted">Vencidas</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-surface">
            <tr>
              <th className="p-4 text-left text-sm font-semibold">Cliente</th>
              <th className="p-4 text-left text-sm font-semibold">Contacto</th>
              <th className="p-4 text-left text-sm font-semibold">Fecha Inicio</th>
              <th className="p-4 text-left text-sm font-semibold">Vencimiento</th>
              <th className="p-4 text-left text-sm font-semibold">Estado</th>
              <th className="p-4 text-left text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {membresiasFilteradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-text-muted">
                  No hay membresías registradas
                </td>
              </tr>
            ) : (
              membresiasFilteradas.map((membresia) => (
                <tr key={membresia.id} className="hover:bg-surface/50">
                  <td className="p-4">
                    <div className="font-medium">{membresia.nombreCliente}</div>
                    {membresia.notas && (
                      <div className="text-xs text-text-muted">{membresia.notas}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{membresia.email}</div>
                    <div className="text-xs text-text-muted">{membresia.whatsapp}</div>
                  </td>
                  <td className="p-4 text-sm">
                    {membresia.fechaInicio.toLocaleDateString("es-CL")}
                  </td>
                  <td className="p-4 text-sm">
                    {membresia.fechaVencimiento.toLocaleDateString("es-CL")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        membresia.estado === "activa"
                          ? "bg-green-100 text-green-700"
                          : membresia.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {membresia.estado}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(membresia)}
                        className="rounded p-2 hover:bg-surface"
                        title="Editar"
                      >
                        <Edit size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(membresia.id)}
                        className="rounded p-2 hover:bg-surface"
                        title="Eliminar"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-surface">
            <h2 className="mb-4 text-xl font-bold">
              {editingId ? "Editar Membresía" : "Agregar Membresía"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Nombre Cliente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombreCliente}
                    onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2"
                    placeholder="+56912345678"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estado: e.target.value as "activa" | "vencida" | "pendiente",
                      })
                    }
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="activa">Activa</option>
                    <option value="vencida">Vencida</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Fecha Inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Fecha Vencimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaVencimiento}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaVencimiento: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Notas</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2"
                  rows={3}
                  placeholder="Información adicional..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-border px-6 py-2 font-semibold hover:bg-surface"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-6 py-2 font-semibold text-white hover:bg-brand/90"
                >
                  {editingId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
