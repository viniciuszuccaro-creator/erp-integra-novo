import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LaunchpadCard({
  title,
  description,
  icon: Icon,
  onClick,
  color = 'blue',
  badge,
  badgeVariant = 'default',
  dataPermission,
  dataAction
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:shadow-blue-200',
    green: 'from-green-500 to-green-600 hover:shadow-green-200',
    red: 'from-red-500 to-red-600 hover:shadow-red-200',
    purple: 'from-purple-500 to-purple-600 hover:shadow-purple-200',
    orange: 'from-orange-500 to-orange-600 hover:shadow-orange-200',
    cyan: 'from-cyan-500 to-cyan-600 hover:shadow-cyan-200',
    emerald: 'from-emerald-500 to-emerald-600 hover:shadow-emerald-200',
    indigo: 'from-indigo-500 to-indigo-600 hover:shadow-indigo-200',
    pink: 'from-pink-500 to-pink-600 hover:shadow-pink-200'
  };

  return (
    <Card
      onClick={onClick}
      data-action={dataAction}
      className={`
        min-w-[280px] min-h-[140px] 
        cursor-pointer 
        border-0 
        bg-gradient-to-br ${colorClasses[color]} 
        text-white
        transition-shadow duration-200
        hover:shadow-xl
        relative
        overflow-hidden
      `}>
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12" />
      
      <CardContent className="bg-[hsl(var(--primary))] p-5 relative z-10 flex flex-col h-full justify-between min-h-[140px]">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {badge &&
          <Badge className="bg-white/30 text-white border-white/50">
              {badge}
            </Badge>
          }
        </div>
        
        <div>
          <h3 className="text-lg font-bold mb-1">{title}</h3>
          <p className="text-sm text-white/90 leading-tight">{description}</p>
        </div>
      </CardContent>
    </Card>);

}
