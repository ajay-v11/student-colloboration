import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const stats = [
    { title: "Active Courses", value: "4", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Study Hours", value: "12.5", icon: Clock, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Study Groups", value: "3", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Achievements", value: "7", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  const upcomingDeadlines = [
    { id: 1, title: "Data Structures Project", course: "CS 201", date: "Today, 11:59 PM", type: "Project" },
    { id: 2, title: "Linear Algebra Quiz", course: "MATH 101", date: "Tomorrow, 2:00 PM", type: "Quiz" },
    { id: 3, title: "Software Eng. Essay", course: "SE 301", date: "Oct 24, 11:59 PM", type: "Essay" },
  ];

  const recentActivity = [
    { id: 1, user: "Alice M.", action: "posted in", target: "React Developers", time: "2h ago" },
    { id: 2, user: "Bob D.", action: "completed", target: "Intro to Python", time: "5h ago" },
    { id: 3, user: "Charlie", action: "joined", target: "AI Enthusiasts", time: "1d ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your studies.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>
              You have {upcomingDeadlines.length} assignments due soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.course} • {item.date}</p>
                  </div>
                  <Badge variant={item.type === 'Project' ? 'default' : 'secondary'}>{item.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              What your peers are up to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{activity.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.user} <span className="text-muted-foreground font-normal">{activity.action}</span>
                    </p>
                    <p className="text-sm text-primary font-medium">
                      {activity.target}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 gap-2" asChild>
                <Link to="/groups">
                    View all activity <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
