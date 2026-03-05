import React from 'react';
import { ArrowLeft, BarChart3, Users, FileText, Stethoscope, AlertTriangle, Loader2 } from 'lucide-react';
import { Patient, InitialHistory, SubsequentConsult, DashboardStats } from '../types';
import { useNavigate } from 'react-router-dom';
import { calculateAge } from '../lib/helpers';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';

interface ReportScreenProps {
  patients: Patient[];
  histories: InitialHistory[];
  consults: SubsequentConsult[];
}

export const ReportScreen = ({ patients, histories, consults }: ReportScreenProps) => {
  const navigate = useNavigate();

  // Calculate stats from the full datasets passed as props
  const totalPatients = patients.length;
  const totalHistories = histories.length;
  const totalConsults = consults.length;

  // Calculate some stats
  const maleCount = patients.filter(p => p.sex === 'Masculino').length;
  const femaleCount = patients.filter(p => p.sex === 'Femenino').length;

  // Age distribution
  const ageGroups: Record<string, number> = {
    '0-18': 0,
    '19-30': 0,
    '31-50': 0,
    '51+': 0
  };

  patients.forEach(p => {
    const ageStr = p.ageDetails ? p.ageDetails.split(' ')[0] : '0';
    const age = parseInt(ageStr) || 0;
    if (age <= 18) ageGroups['0-18']++;
    else if (age <= 30) ageGroups['19-30']++;
    else if (age <= 50) ageGroups['31-50']++;
    else ageGroups['51+']++;
  });

  // Example: Calculate patients seen this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const patientsSeenThisMonth = new Set([
    ...histories.filter(h => {
      const d = new Date(h.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).map(h => h.patientId),
    ...consults.filter(c => {
      const d = new Date(c.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).map(c => c.patientId)
  ]).size;

  // Advanced Stats State
  const [advancedStats, setAdvancedStats] = React.useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const getStats = httpsCallable(functions, 'getDashboardAdvancedStats');
        const result = await getStats();
        setAdvancedStats(result.data as DashboardStats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Green, Orange, Red

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/app/patients')} className="bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 text-gray-600 shadow-sm transition-all">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="text-blue-600" /> Reportes y Estadísticas
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Pacientes</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalPatients}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <FileText className="text-purple-600" size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+5%</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Historias Clínicas</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalHistories}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Stethoscope className="text-indigo-600" size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+8%</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Consultas Totales</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalConsults}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <BarChart3 className="text-orange-600" size={24} />
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">Este mes</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Pacientes Atendidos</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{patientsSeenThisMonth}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Distribución por Sexo</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-8 border-blue-500 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-gray-800">{Math.round((maleCount / totalPatients) * 100) || 0}%</span>
              </div>
              <p className="font-medium text-gray-600">Masculino ({maleCount})</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full border-8 border-pink-500 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-gray-800">{Math.round((femaleCount / totalPatients) * 100) || 0}%</span>
              </div>
              <p className="font-medium text-gray-600">Femenino ({femaleCount})</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Grupos Etarios</h3>
          <div className="space-y-4">
            {Object.entries(ageGroups).map(([range, count]) => (
              <div key={range}>
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                  <span>{range} años</span>
                  <span>{count} ({Math.round((count / totalPatients) * 100) || 0}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(count / totalPatients) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loadingStats ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500 font-medium">Cargando análisis epidemiológico...</p>
        </div>
      ) : advancedStats ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 border-b border-gray-200 pb-4">
            <BarChart3 className="text-indigo-600" /> Epidemiología y Riesgos
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Obesity Prevalence */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Prevalencia de Peso (IMC)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Normopeso', value: advancedStats.obesityPrevalence.normal },
                        { name: 'Sobrepeso', value: advancedStats.obesityPrevalence.overweight },
                        { name: 'Obesidad', value: advancedStats.obesityPrevalence.obese },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Diagnoses */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Top 5 Diagnósticos del Mes</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={advancedStats.topDiagnoses}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12, fill: '#4b5563' }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={24} name="Casos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Risk Patients Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-red-50/30">
              <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                Pacientes que Requieren Atención
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm">Paciente</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Riesgos Detectados</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {advancedStats.riskPatients.length > 0 ? advancedStats.riskPatients.map(rp => {
                    const p = patients.find(pat => pat.id === rp.id);
                    if (!p) return null;
                    return (
                      <tr key={rp.id} className="hover:bg-gray-50 mx-transition">
                        <td className="p-4">
                          <p className="font-bold text-gray-900">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-gray-500">{calculateAge(p.birthDate)} años</p>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {rp.risks.map((risk, idx) => (
                              <span key={idx} className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-200">
                                {risk}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => navigate(`/app/profile/${p.id}`)}
                            className="text-blue-600 font-bold text-sm hover:underline"
                          >
                            Ver Perfil
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        No se detectaron pacientes con riesgo alto en los registros recientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
