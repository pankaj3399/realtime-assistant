import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

export default function Features() {
  const features = [
    { 
      title: 'Automated Data Analysis', 
      description: 'Our AI algorithms analyze your data to provide insightful reports automatically.',
      icon: <BarChart3 className="h-8 w-8 text-[#1565C0]" />
    },
    { 
      title: 'Custom Visualizations', 
      description: 'Create stunning, interactive visualizations tailored to your specific needs.',
      icon: <PieChart className="h-8 w-8 text-[#1565C0]" />
    },
    { 
      title: 'Predictive Insights', 
      description: 'Leverage machine learning to forecast trends and make data-driven decisions.',
      icon: <TrendingUp className="h-8 w-8 text-[#1565C0]" />
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-universe text-center mb-12 text-[#1C1B1B]">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl font-semibold mb-2">{feature.title}</CardTitle>
                <CardDescription className='font-inter'>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

