// Web Audio API synthesizer for playful cartoon sound effects

class SoundEffects {
  private ctx: AudioContext | null = null
  public enabled = true

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playPop(pitch = 440) {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.8, this.ctx.currentTime + 0.08)

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.09)
    } catch {
      // Audio context might be restricted
    }
  }

  playGasp() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(580, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12)

      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(now + 0.18)
    } catch {
      // Ignore
    }
  }

  playKeystroke(length: number) {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      const baseFreq = 480 + (length % 8) * 35
      osc.type = 'sine'
      osc.frequency.setValueAtTime(baseFreq, now)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(now + 0.04)
    } catch {
      // Ignore
    }
  }

  playBoing() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.linearRampToValueAtTime(600, now + 0.1)
      osc.frequency.linearRampToValueAtTime(350, now + 0.2)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(now + 0.22)
    } catch {
      // Ignore
    }
  }

  playSuccess() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const notes = [523.25, 659.25, 783.99, 1046.5]
      notes.forEach((freq, index) => {
        if (!this.ctx) return
        const now = this.ctx.currentTime + index * 0.09
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)

        gain.gain.setValueAtTime(0.12, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now)
        osc.stop(now + 0.3)
      })
    } catch {
      // Ignore
    }
  }

  playBlush() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const notes = [659.25, 830.61, 987.77]
      notes.forEach((freq, idx) => {
        if (!this.ctx) return
        const now = this.ctx.currentTime + idx * 0.07
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)
        gain.gain.setValueAtTime(0.07, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now)
        osc.stop(now + 0.28)
      })
    } catch {
      // Ignore
    }
  }

  playSpin() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.18)
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.32)

      gain.gain.setValueAtTime(0.09, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } catch {
      // Ignore
    }
  }

  playFloat() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.22)

      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.3)
    } catch {
      // Ignore
    }
  }

  playGiggle() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const pitches = [580, 680, 620, 740, 820]
      pitches.forEach((freq, i) => {
        if (!this.ctx) return
        const now = this.ctx.currentTime + i * 0.055
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)
        gain.gain.setValueAtTime(0.09, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(now)
        osc.stop(now + 0.05)
      })
    } catch {
      // Ignore
    }
  }

  playError() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, now)
      osc.frequency.linearRampToValueAtTime(110, now + 0.2)

      gain.gain.setValueAtTime(0.09, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(now + 0.25)
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEffects()
