import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Shield, Zap, DollarSign, Sun, Moon, Heart } from "lucide-react"

function Page() {
  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full opacity-20 cute-bounce"></div>
      <div
        className="absolute top-32 left-8 w-8 h-8 bg-gradient-to-br from-pink-300 to-orange-200 rounded-full opacity-30 cute-bounce"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-48 right-20 w-12 h-12 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full opacity-25 cute-bounce"
        style={{ animationDelay: "0.5s" }}
      ></div>

      {/* Header */}
      <div className="px-6 pt-8 pb-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Selamat Datang!
              <Sun className="w-6 h-6 text-orange-400 cute-bounce" />
            </h1>
            <p className="text-muted-foreground text-sm">Cross-chain lending yang mudah dan aman ✨</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center sunset-glow relative">
            <span className="text-white font-bold text-lg">S</span>
            <Heart className="w-3 h-3 text-pink-200 absolute -top-1 -right-1" />
          </div>
        </div>

        <div className="bg-orange-600 border-0 shadow-lg relative overflow-hidden warm-shadow rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-pink-500"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm flex items-center gap-1">
                  <Moon className="w-4 h-4" />
                  Total Balance
                </p>
                <p className="text-3xl font-bold text-white mb-1">$12,450.00</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-white" />
                  <span className="text-white text-xs">+5.2% hari ini 🌅</span>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-white/95 text-primary border-0 rounded-full px-3 py-1 font-semibold">
                  ✨ Active
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          Quick Actions
          <Zap className="w-5 h-5 text-orange-400" />
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Button className="h-20 flex-col gap-3 bg-gradient-to-br from-card to-accent/30 hover:from-accent/50 hover:to-card text-card-foreground border-2 border-orange-200/50 rounded-2xl warm-shadow transition-all duration-300 hover:scale-105">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold">Lend 💰</span>
          </Button>
          <Button className="h-20 flex-col gap-3 bg-gradient-to-br from-card to-secondary/30 hover:from-secondary/50 hover:to-card text-card-foreground border-2 border-pink-200/50 rounded-2xl warm-shadow transition-all duration-300 hover:scale-105">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-pink-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold">Borrow 📈</span>
          </Button>
        </div>
      </div>

      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          Featured Pools
          <span className="text-orange-400">🏊‍♀️</span>
        </h2>
        <div className="space-y-4">
          <Card className="border-2 border-orange-200/50 shadow-sm rounded-2xl warm-shadow hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center sunset-glow">
                    <span className="text-white font-bold text-sm">ETH</span>
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-1">
                      Ethereum Pool
                      <span className="text-orange-400">⚡</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Cross-chain lending yang aman</CardDescription>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-orange-100 to-pink-100 text-primary border border-primary/30 rounded-full px-3 py-1 font-bold">
                  8.5% APY 🚀
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-bold text-primary">$2.4M 💎</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200/50 shadow-sm rounded-2xl warm-shadow hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-pink-600 flex items-center justify-center sunset-glow">
                    <span className="text-white font-bold text-sm">BTC</span>
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-1">
                      Bitcoin Pool
                      <span className="text-pink-400">🌸</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Cross-chain lending yang mudah</CardDescription>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-pink-100 to-orange-100 text-secondary-foreground border border-secondary/30 rounded-full px-3 py-1 font-bold">
                  7.2% APY 🌟
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-bold text-secondary-foreground">$1.8M 💖</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          Why Choose Us?
          <span className="text-pink-400">💕</span>
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-card to-orange-50 rounded-2xl border-2 border-orange-200/50 warm-shadow hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-200/50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1">
                Secure & Audited
                <span className="text-green-500">🛡️</span>
              </h3>
              <p className="text-xs text-muted-foreground">Smart contracts audited by top firms</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-card to-pink-50 rounded-2xl border-2 border-pink-200/50 warm-shadow hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-pink-200/50 flex items-center justify-center">
              <Zap className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1">
                Lightning Fast
                <span className="text-yellow-500">⚡</span>
              </h3>
              <p className="text-xs text-muted-foreground">Cross-chain transactions in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Page;