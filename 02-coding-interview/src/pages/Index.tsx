import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Play, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/services/api';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const room = await api.createRoom('javascript');
      toast.success('Room created!');
      navigate(`/room/${room.id}`);
    } catch {
      toast.error('Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }

    setIsJoining(true);
    try {
      const room = await api.joinRoom(roomCode.trim().toUpperCase());
      if (room) {
        toast.success('Joined room!');
        navigate(`/room/${room.id}`);
      } else {
        toast.error('Room not found');
      }
    } catch {
      toast.error('Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinRoom();
    }
  };

  const features = [
    {
      icon: Code2,
      title: 'Syntax Highlighting',
      description: 'Support for JavaScript and Python with Monaco Editor',
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'See code changes instantly across all participants',
    },
    {
      icon: Play,
      title: 'Run Code',
      description: 'Execute Python with Pyodide WASM runtime in-browser',
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description: 'No account required, just create or join a room',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Code2 className="h-4 w-4" />
              Collaborative Coding Interview Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Code Together,{' '}
              <span className="text-primary">Interview Better</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              A real-time collaborative code editor for technical interviews. 
              Share code instantly with syntax highlighting and in-browser execution.
            </p>
          </div>

          {/* Action Cards */}
          <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Create Room Card */}
            <Card className="relative overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 glow-primary">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Start New Interview</h3>
                    <p className="text-sm text-muted-foreground">Create a room instantly</p>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateRoom} 
                  disabled={isCreating}
                  className="w-full gradient-primary hover:opacity-90 transition-opacity"
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Join Room Card */}
            <Card className="relative overflow-hidden border-2 border-transparent hover:border-accent/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                    <Users className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Join Existing Room</h3>
                    <p className="text-sm text-muted-foreground">Enter a room code</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. ABC123"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    maxLength={6}
                    className="uppercase font-mono tracking-wider"
                  />
                  <Button 
                    onClick={handleJoinRoom}
                    disabled={isJoining || !roomCode.trim()}
                    variant="secondary"
                  >
                    {isJoining ? '...' : 'Join'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-foreground mb-12">
          Everything you need for technical interviews
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="text-center p-6 animate-fade-in"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <CardContent className="pt-4">
                <div className="h-12 w-12 mx-auto rounded-xl bg-muted flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with React + Monaco Editor + Pyodide</p>
          <p className="mt-1">Multi-tab sync enabled for testing collaboration</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
