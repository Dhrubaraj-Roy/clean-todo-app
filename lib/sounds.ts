"use client"

// Sound utility functions
class SoundManager {
  private audioContext: AudioContext | null = null
  private isEnabled = true

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (e) {
        console.warn('Audio context not supported')
        this.isEnabled = false
      }
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext || !this.isEnabled) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Task completion sound - success chime
  playTaskComplete() {
    if (!this.isEnabled) return
    
    // Play a pleasant ascending chime
    setTimeout(() => this.createTone(523.25, 0.15), 0) // C5
    setTimeout(() => this.createTone(659.25, 0.15), 100) // E5
    setTimeout(() => this.createTone(783.99, 0.2), 200) // G5
  }

  // Task creation sound - gentle pop
  playTaskCreate() {
    if (!this.isEnabled) return
    
    // Quick ascending tone
    this.createTone(440, 0.1) // A4
    setTimeout(() => this.createTone(554.37, 0.1), 50) // C#5
  }

  // Task movement sound - notification bell
  playTaskMove() {
    if (!this.isEnabled) return
    
    // Bell-like sound
    this.createTone(800, 0.2, 'triangle')
    setTimeout(() => this.createTone(1000, 0.15, 'triangle'), 100)
  }

  // Reminder notification - attention sound
  playReminderAlert() {
    if (!this.isEnabled) return
    
    // Gentle alert sound
    setTimeout(() => this.createTone(660, 0.2), 0)
    setTimeout(() => this.createTone(660, 0.2), 300)
    setTimeout(() => this.createTone(660, 0.3), 600)
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  isAudioEnabled() {
    return this.isEnabled && this.audioContext !== null
  }
}

export const soundManager = new SoundManager()