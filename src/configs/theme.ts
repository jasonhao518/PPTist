import type { SlideBackground } from '@/types/slides'

export interface PresetTheme {
  background: Record<string, SlideBackground>
  fontColor: string
  fontname: string
  colors: string[]
}

export const PRESET_THEMES: PresetTheme[] = [
  {
    background: {
      default: {
        type: 'solid',
        color: '#ffffff',
      }
    },
    fontColor: '#333333',
    fontname: 'Microsoft Yahei',
    colors: ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4', '#70ad47'],
  },
  {
    fontColor: '#333333',
    fontname: 'Microsoft Yahei',
    colors: ['#83992a', '#3c9670', '#44709d', '#a23b32', '#d87728', '#deb340'],
    background: {
      default: {
        type: 'image',
        imageSize: 'cover',
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSDxASEBAQEBAVDw8QDxUQEBAVDxAVFREWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDQ0OFRAQFy0dFx0tKystKystLSstLTcrLSstKy0tKy0rLS03KzcrNysrLSs3LSsrKy0rKysrKystKysrK//AABEIAKgBLAMBIgACEQEDEQH/xAAbAAEAAwEBAQEAAAAAAAAAAAAAAQIDBAUGB//EADQQAAIBAgMGBAUDBAMAAAAAAAABAgMRBBIhBTFBUWFxE4GRoQYUIrHRMlLBM0Ji8BZyk//EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAGhEBAQEBAQEBAAAAAAAAAAAAAAEREgIhE//aAAwDAQACEQMRAD8A/VAAbcQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABR1EWTuBIBAEgzdTkVc2Bq2UdVGTBRaVV8NBGq+OpUWA6E7knMnY0VXoQalZzsrlPF6HNiKrb6Io1jiua9DeEk1dHnxNaFaz6BNdoIJIoAAAAAAAAAAABABPlqSefVwElUzUJwoqX9ZeHmUmv0yisyUZb03Z305HbSi0rSlnfNpJ+i0CrgAIEEkALi4FgFzOTbL2IsBkkXjoTlIsBomUmypVq4FZS5FkQ4ixRNgExcACcpVsASkVTLZugESOZm9WWhikEZshl5IZShTfD0NlUkuL8zBQLpsDqhiOej9jWMk9zOO5pGJFdRDZzTduL9TnlJ8xhr0gAQAAAAAGGLqyjHNCHiW1ks1p245FZ5pdNO5FLFZoOahVVr6Sg1N9ovU6AFcuE2hSqJZKkW2s2W9qiX+UHrF71ZrgdRWNNJtpJNu8mkk5Pm+ZYIAACACQIFiQBWwsWAFbDKWAFcoylgBTIMhcAUyjIJMRYDIRKJdspUe4DGcLmVTQ3k+Jyz5lRk7veWpu3YmwaKjaPRk5TCJtRuRWkYkSuixLQGMrveUlNLhc0q2S6nO0B6oAIoAAAAAAAAAAAAAAAAAAAAAAAAAABWTJIsBVmE5XZtNFGii8XdK5LK02TIgxqyv2MXE3sMpUYeQtc1aLKGnIaM4wLR0JIel/YC85JFY1eZll4kpAKiuyPDNFDcWUAOoAEUAAAAAAAAAAAAAAAAAAAAAAAAAAAgkAUaK2NCHEDKxJaxKiUVUQ0XsQQUtoDTKVlECtrGUnc2kiuTQoysWSNFHQmwRSCLZWXSLBUgAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiwsSAIILEAELAkCCCQBAaJsAIJsCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUqVYxtmlGN912lfsBcEXM61eMFecoxXOTSXqwNQeNW+JsNHTxMz/AMU2vXcVofFGHlJRzON9zkrL1LlTY9sFPEVr3Vu587t74phSThStUqbtP0x7sSWrbI+ilUS3tImMk9zPyDG4yrVk5VJyk+7suy4E0MfWh+irUj0Unb0N/m5/o/YAfJ/DvxWqmWnXtGeiUv7Zfhn1SmuaMWWNyyrAi5JFQSAAAIAkEACQQRGSe5pro7oCbgAACQAAAAgkARcXBWrUUYuUmoxW9t2S8wLXFzkwe06NWTjTqKUlrbVO3NX3nXYBcXAAkHNisdTpp55xj0usz7R3s8nEbfzKSpQaurKUna3XKXEtjt2vtaNGLtaVS30x/mXJHw2PnVrSzVZuT1sv7Y9Irgep4K3ye/ffeyrjrpHTqbnxi/Xn4XFVqcXGnVnGLVmr3Xlfd5GHhX3+57caa4x9LFalJcI+pdTHivCdijw/Q9/DYTO7NJO2h0vZNh0cvmlOoo5c81HkpSt6HO6B9NPZj5HLLZjXAupy8Twh4KPQr4ZR36fdnnV05dEVGE60L6XfZaHp4XaNVxShWqWWlr7vU85YboWhRlF3jdMVI7/Hrp6Vq3/pL8npYDb2Ipv6m6seKnv8pHl0sRLjFPtdHdhoqb1zRfRkrUfQP4spW/p1s3K0Pvc6tn7epVXa7pye5Tsr9mfP/JLuVng1yMZG9r7gk+PpY6tTVo1JWWlpJSt6q5z4ytWqaTqTa5J5Y+isTlen2zmuLXqjytrbehR0japU/anpH/s/4Pk/kugcYR36dNSzzEvqr7T2tVr6SeWH7YaRffmNh7Rlh5aLNTf648O65MrDLJaeZWo4riaZfWf8loWved+WR3/HuRS+JcPK31OL4qSScer1+x8jVaUdNXwOJ0PMnEXuvvqvxDQUlFSck98oq8V+fI3W2aDV/Gj739LH57ShJbtOh1Qjfo/uOId1+hUK8ZxzQkpR5o1Pg8PKrTb8Oco88t7PujStia731qnZSa+xOWun2GNxsKUc1SSiuC/ufZcTxqnxbSt9NOrJ9oJetz5ipSk3eTlJ85Nv3IjTlxXsWeYzfVe/P4vbX00NeGapp7I8HaOPrV5XqSulrGK0guy/kl0+LMpVf2r1LJIltqsKb/3eexsnHzpTTblKO6Sbbuul+JxYeV98fQ9KjhrikfVYbFQqK8JJ9OK7o3PmqOFPSo1ZpWvfurv1OdjpK/K1VUk3ulvfPvctT2rWjoqjt1UX7tAHoedvQ2/VjJOWWa4ppJ+TW4+32dGNWnGpDWMlfquafVMgGPc+N+L9dqwfQt8mAc9dcR8nbVaNao7aEoy+m8c6X1K6uutuQAFMUlFaK8uC/J4lSjU1+qXPp5ACJXHU2e27u7fUyezXwQBrUxC2e+KLLCLkANTEPD9PY3o0HwQA0kdsF0JcehAIqfBXFW68DT5ZacV7kgDmr0pWdvpXvbucMsA78yQXTHLi8MoK8mordrvfZcTzvmqd3q1yunbyANefrnXBWx7zfTpFcP3dz2dmVadTc1m4xb+ry5gGrElehWw2Xroc/gOS3W5W4kgxrbfDucdGrrr+TSd5O/1Ky3Jq32IBFTaTX6UvLUjwpdPQACk8C3vuaUtnf7YAaY66eBtwO3DYa3YAzrWO+FA1VIAiv//Z'
      }
    }
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#ffffff',
      }
    },
    fontColor: '#333333',
    fontname: 'Microsoft Yahei',
    colors: ['#e48312', '#bd582c', '#865640', '#9b8357', '#c2bc80', '#94a088'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#ffffff',
      }
    },
    fontColor: '#333333',
    fontname: 'Microsoft Yahei',
    colors: ['#bdc8df', '#003fa9', '#f5ba00', '#ff7567', '#7676d9', '#923ffc'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#ffffff',
      }
    },
    fontColor: '#333333',
    fontname: 'Microsoft Yahei',
    colors: ['#90c225', '#54a121', '#e6b91e', '#e86618', '#c42f19', '#918756'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#ffffff',
      }
    },
    fontColor: '#333333',
    fontname: 'Microsoft Yahei',
    colors: ['#1cade4', '#2683c6', '#27ced7', '#42ba97', '#3e8853', '#62a39f'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#e9efd6',
      }
    },
    fontColor: '#333333',
    fontname: 'Microsoft Yahei',
    colors: ['#a5300f', '#de7e18', '#9f8351', '#728653', '#92aa4c', '#6aac91'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#17444e',
      }
    },
    fontColor: '#ffffff',
    fontname: 'Microsoft Yahei',
    colors: ['#b01513', '#ea6312', '#e6b729', '#6bab90', '#55839a', '#9e5d9d'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#36234d',
      }
    },
    fontColor: '#ffffff',
    fontname: 'Microsoft Yahei',
    colors: ['#b31166', '#e33d6f', '#e45f3c', '#e9943a', '#9b6bf2', '#d63cd0'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#247fad',
      }
    },
    fontColor: '#ffffff',
    fontname: 'Microsoft Yahei',
    colors: ['#052f61', '#a50e82', '#14967c', '#6a9e1f', '#e87d37', '#c62324'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#103f55',
      }
    },
    fontColor: '#ffffff',
    fontname: 'Microsoft Yahei',
    colors: ['#40aebd', '#97e8d5', '#a1cf49', '#628f3e', '#f2df3a', '#fcb01c'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#242367',
      }
    },
    fontColor: '#ffffff',
    fontname: 'Microsoft Yahei',
    colors: ['#ac3ec1', '#477bd1', '#46b298', '#90ba4c', '#dd9d31', '#e25345'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#e4b75e',
      }
    },
    fontColor: '#333333',
    fontname: 'Microsoft Yahei',
    colors: ['#f0a22e', '#a5644e', '#b58b80', '#c3986d', '#a19574', '#c17529'],
  },
  {
    background: {
      default: {
        type: 'solid',
        color: '#333333',
      }
    },
    fontColor: '#ffffff',
    fontname: 'Microsoft Yahei',
    colors: ['#bdc8df', '#003fa9', '#f5ba00', '#ff7567', '#7676d9', '#923ffc'],
  },
]