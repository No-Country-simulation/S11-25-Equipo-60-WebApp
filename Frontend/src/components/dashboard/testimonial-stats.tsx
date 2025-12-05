"use client"

import { useEffect, useState } from 'react';
import { testimonialService } from '@/services/testimonial.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, Clock, CheckCircle, XCircle, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface TestimonialStatsData {
  total: number;
  aprobados: number;
  rechazados: number;
  en_espera: number;
  publicados: number;
  borradores: number;
  ocultos: number;
  promedio_ranking?: number;
}

/**
 * Componente para mostrar estadísticas de testimonios
 * Solo accesible para editores de la organización
 * 
 * Uso:
 * ```tsx
 * <TestimonialStats />
 * ```
 */
export const TestimonialStats = () => {
  const [stats, setStats] = useState<TestimonialStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await testimonialService.getStatistics();
      setStats(data);
    } catch (error: any) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No se pudieron cargar las estadísticas</p>
        </CardContent>
      </Card>
    );
  }

  const statsCards = [
    {
      title: 'Total Testimonios',
      value: stats.total || 0,
      icon: FileText,
      description: 'Testimonios totales',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'En Espera',
      value: stats.en_espera || 0,
      icon: Clock,
      description: 'Pendientes de revisión',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      title: 'Aprobados',
      value: stats.aprobados || 0,
      icon: CheckCircle,
      description: 'Testimonios aprobados',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Rechazados',
      value: stats.rechazados || 0,
      icon: XCircle,
      description: 'Testimonios rechazados',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Publicados',
      value: stats.publicados || 0,
      icon: Eye,
      description: 'Visibles públicamente',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Promedio Rating',
      value: stats.promedio_ranking ? stats.promedio_ranking.toFixed(1) : 'N/A',
      icon: TrendingUp,
      description: 'Calificación promedio',
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Estadísticas de Testimonios</h2>
        <p className="text-muted-foreground">
          Vista general del estado de testimonios en tu organización
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
