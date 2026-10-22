import wave
import struct
import math
import random
import os

SAMPLE_RATE = 44100

def write_wav(filename, samples):
    with wave.open(filename, 'w') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        data = bytearray()
        for s in samples:
            # Clamp to 16-bit range
            s = max(-1.0, min(1.0, s))
            val = int(s * 32767)
            data += struct.pack('<h', val)
        wav.writeframes(data)

os.makedirs('assets/sounds', exist_ok=True)

# 1. dice_roll.wav: Real wooden dice cup shake and tumbling clatter (0.85s)
def gen_dice_roll():
    duration = 0.85
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    # Random impact times mimicking dice shaking in cup
    num_impacts = 28
    for _ in range(num_impacts):
        t0 = random.uniform(0.02, duration - 0.08)
        start_idx = int(t0 * SAMPLE_RATE)
        # Each impact is a combination of hollow wood resonance (280Hz, 520Hz) and acrylic click (1600Hz)
        amp = random.uniform(0.25, 0.65)
        decay = random.uniform(0.015, 0.035)
        decay_samples = int(decay * SAMPLE_RATE)
        freq_wood = random.uniform(260, 480)
        freq_click = random.uniform(1400, 2200)
        for i in range(min(decay_samples, num_samples - start_idx)):
            t = i / SAMPLE_RATE
            env = math.exp(-t * (1.0 / (decay * 0.35)))
            wood = math.sin(2 * math.pi * freq_wood * t)
            click = math.sin(2 * math.pi * freq_click * t) * (1.0 if random.random() > 0.5 else -1.0)
            samples[start_idx + i] += (wood * 0.6 + click * 0.4) * env * amp
    return samples

# 2. dice_land.wav: Crisp double bounce of dice settling on table (0.35s)
def gen_dice_land():
    duration = 0.35
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    bounces = [(0.01, 0.7, 340, 1800), (0.07, 0.45, 380, 2100), (0.13, 0.25, 420, 2400)]
    for t0, amp, f_wood, f_click in bounces:
        start_idx = int(t0 * SAMPLE_RATE)
        decay = 0.04
        decay_samples = int(decay * SAMPLE_RATE)
        for i in range(min(decay_samples, num_samples - start_idx)):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 60)
            s = (math.sin(2 * math.pi * f_wood * t) * 0.65 + math.sin(2 * math.pi * f_click * t) * 0.35) * env * amp
            samples[start_idx + i] += s
    return samples

# 3. coin.wav: Realistic metallic coins clinking together (0.5s)
def gen_coins():
    duration = 0.55
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    coin_times = [0.01, 0.05, 0.09, 0.14, 0.20]
    modes = [1975, 2480, 3340, 4120, 5200]
    for t0 in coin_times:
        start_idx = int(t0 * SAMPLE_RATE)
        amp = random.uniform(0.3, 0.6)
        decay = random.uniform(0.18, 0.32)
        decay_samples = int(decay * SAMPLE_RATE)
        for i in range(min(decay_samples, num_samples - start_idx)):
            t = i / SAMPLE_RATE
            env = math.exp(-t * (1.0 / (decay * 0.22)))
            val = 0.0
            for m in modes:
                val += math.sin(2 * math.pi * (m * random.uniform(0.98, 1.02)) * t) * 0.2
            samples[start_idx + i] += val * env * amp
    return samples

# 4. token_hop.wav: Cartoon spring boing / hop sound (0.24s)
def gen_token_hop():
    duration = 0.24
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 12.0)
        # Pitch slides from 320Hz to 680Hz
        freq = 320.0 + (360.0 * (1.0 - math.exp(-t * 25.0)))
        w = math.sin(2 * math.pi * freq * t)
        samples[i] = w * env * 0.55
    return samples

# 5. heavy_land.wav: Punchy cartoon bass impact thud (0.32s)
def gen_heavy_land():
    duration = 0.32
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 18.0)
        # Deep bass drop from 140Hz down to 48Hz
        freq = 48.0 + 92.0 * math.exp(-t * 22.0)
        bass = math.sin(2 * math.pi * freq * t)
        click = (random.random() * 2 - 1) * math.exp(-t * 120.0) * 0.3
        samples[i] = (bass * 0.8 + click) * env * 0.75
    return samples

# 6. build.wav: Carpenter wood hammer tap + sparkly chime (0.45s)
def gen_build():
    duration = 0.45
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    # Two hammer hits
    hits = [(0.02, 0.7, 440), (0.14, 0.85, 380)]
    for t0, amp, f in hits:
        start_idx = int(t0 * SAMPLE_RATE)
        for i in range(min(int(0.08 * SAMPLE_RATE), num_samples - start_idx)):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 60)
            samples[start_idx + i] += math.sin(2 * math.pi * f * t) * env * amp
    # Sparkle chime
    chimes = [(0.22, 1046.5), (0.28, 1318.5), (0.34, 1568.0)]
    for t0, f in chimes:
        start_idx = int(t0 * SAMPLE_RATE)
        for i in range(min(int(0.12 * SAMPLE_RATE), num_samples - start_idx)):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 25)
            samples[start_idx + i] += math.sin(2 * math.pi * f * t) * env * 0.3
    return samples

# 7. fanfare.wav: Triumphant brass victory fanfare (0.8s)
def gen_fanfare():
    duration = 0.8
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    notes = [
        (0.02, 0.12, 523.25),  # C5
        (0.15, 0.12, 659.25),  # E5
        (0.28, 0.14, 783.99),  # G5
        (0.44, 0.34, 1046.50), # C6 (held)
    ]
    for t0, dur, f in notes:
        start_idx = int(t0 * SAMPLE_RATE)
        dur_samples = int(dur * SAMPLE_RATE)
        for i in range(min(dur_samples, num_samples - start_idx)):
            t = i / SAMPLE_RATE
            env = math.sin(math.pi * (i / dur_samples)) ** 0.5
            # Brass overtone richness (1st, 2nd, 3rd harmonics)
            brass = (math.sin(2 * math.pi * f * t) * 0.55 +
                     math.sin(4 * math.pi * f * t) * 0.28 +
                     math.sin(6 * math.pi * f * t) * 0.17)
            samples[start_idx + i] += brass * env * 0.5
    return samples

# 8. windchime.wav: Magical fairy chime sweep for cards/shields (0.6s)
def gen_windchime():
    duration = 0.6
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    freqs = [1046.5, 1174.7, 1318.5, 1567.98, 1760.0, 2093.0, 2349.3]
    for idx, f in enumerate(freqs):
        t0 = 0.03 * idx
        start_idx = int(t0 * SAMPLE_RATE)
        dur_samples = int(0.35 * SAMPLE_RATE)
        for i in range(min(dur_samples, num_samples - start_idx)):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 14.0)
            bell = math.sin(2 * math.pi * f * t) + 0.3 * math.sin(4 * math.pi * f * t)
            samples[start_idx + i] += bell * env * 0.22
    return samples

# 9. airplane.wav: Airport chime (ding-dong) + jet flyby (0.8s)
def gen_airplane():
    duration = 0.8
    num_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * num_samples
    # Ding (880Hz) - Dong (587Hz)
    chimes = [(0.02, 0.22, 880.0), (0.24, 0.35, 587.33)]
    for t0, dur, f in chimes:
        start_idx = int(t0 * SAMPLE_RATE)
        for i in range(min(int(dur * SAMPLE_RATE), num_samples - start_idx)):
            t = i / SAMPLE_RATE
            env = math.exp(-t * 12.0)
            samples[start_idx + i] += math.sin(2 * math.pi * f * t) * env * 0.4
    # Gentle whoosh
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        whoosh_env = math.sin(math.pi * (t / duration)) ** 2
        noise = (random.random() * 2 - 1)
        samples[i] += noise * whoosh_env * 0.12
    return samples

write_wav('assets/sounds/dice_roll.wav', gen_dice_roll())
write_wav('assets/sounds/dice_land.wav', gen_dice_land())
write_wav('assets/sounds/coin.wav', gen_coins())
write_wav('assets/sounds/token_hop.wav', gen_token_hop())
write_wav('assets/sounds/heavy_land.wav', gen_heavy_land())
write_wav('assets/sounds/build.wav', gen_build())
write_wav('assets/sounds/fanfare.wav', gen_fanfare())
write_wav('assets/sounds/windchime.wav', gen_windchime())
write_wav('assets/sounds/airplane.wav', gen_airplane())

print("All acoustic sound files generated successfully!")
