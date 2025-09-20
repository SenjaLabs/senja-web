# Beary Alert Components 🐻

Komponen alert yang lucu dan friendly menggunakan gambar beary untuk memberikan feedback yang menyenangkan kepada pengguna.

## Fitur ✨

- 🎨 **Desain Lucu**: Menggunakan karakter beary yang menggemaskan
- 🎭 **4 Jenis Alert**: Success, Pending, Failed, dan Info
- 🎪 **Animasi Menarik**: Bounce, shake, pulse, dan sparkle effects
- 🔧 **Reusable**: Mudah digunakan di berbagai komponen
- 📱 **Responsive**: Tampil sempurna di desktop dan mobile
- 🎯 **TypeScript Support**: Full type safety
- 🎨 **Customizable**: Bisa disesuaikan title, description, dan button text

## Komponen yang Tersedia

### 1. Basic Alert Components

#### SuccessAlert
```tsx
import { SuccessAlert } from '@/components/alert'

<SuccessAlert
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Transaksi Berhasil! 🎉"
  description="Transaksi Anda telah berhasil diproses."
  buttonText="Oke, Terima Kasih!"
  onButtonClick={() => alert('Success!')}
/>
```

#### PendingAlert
```tsx
import { PendingAlert } from '@/components/alert'

<PendingAlert
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Transaksi Sedang Diproses ⏳"
  description="Mohon tunggu sebentar..."
  buttonText="Oke, Saya Tunggu"
/>
```

#### FailedAlert
```tsx
import { FailedAlert } from '@/components/alert'

<FailedAlert
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Ups, Ada Masalah! 😅"
  description="Transaksi gagal diproses."
  buttonText="Coba Lagi"
/>
```

### 2. Advanced BearyAlert Component

Komponen yang lebih fleksibel dengan konfigurasi otomatis berdasarkan type:

```tsx
import { BearyAlert } from '@/components/alert'

<BearyAlert
  type="success" // "success" | "pending" | "failed" | "info"
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Custom Title" // Optional, akan menggunakan default jika tidak diisi
  description="Custom description" // Optional
  buttonText="Custom Button" // Optional
  showSparkles={true} // Hanya untuk type="success"
  onButtonClick={() => alert('Clicked!')}
/>
```

## Penggunaan dengan Hook

Untuk kemudahan penggunaan, tersedia custom hook `useBearyAlert`:

```tsx
import { useBearyAlert } from '@/components/alert/example-usage'

function MyComponent() {
  const { showAlert, hideAlert, AlertComponent } = useBearyAlert()

  const handleSuccess = () => {
    showAlert('success', {
      title: 'Pembayaran Berhasil!',
      description: 'Pembayaran Anda telah diproses.',
      onButtonClick: () => {
        // Redirect atau action lainnya
        router.push('/success')
      }
    })
  }

  const handleError = () => {
    showAlert('failed', {
      title: 'Gagal Memproses',
      description: 'Silakan coba lagi nanti.',
      buttonText: 'Tutup'
    })
  }

  return (
    <div>
      <button onClick={handleSuccess}>Simulate Success</button>
      <button onClick={handleError}>Simulate Error</button>
      
      {/* Render alert component */}
      <AlertComponent />
    </div>
  )
}
```

## Props Interface

### SuccessAlertProps, PendingAlertProps, FailedAlertProps
```tsx
interface AlertProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  className?: string
}
```

### BearyAlertProps
```tsx
interface BearyAlertProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "pending" | "failed" | "info"
  title?: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  className?: string
  showSparkles?: boolean // Default: true
}
```

## Animasi yang Tersedia

- **Success**: `animate-happy-bounce` dengan sparkle effects
- **Pending**: `animate-pulse` dengan spinning icon
- **Failed**: `animate-shake` dengan bouncing icon
- **Info**: `animate-float` dengan wiggling icon

## Contoh Penggunaan Lengkap

Lihat file `example-usage.tsx` untuk contoh penggunaan yang lebih lengkap dengan berbagai skenario.

## Styling

Komponen menggunakan Tailwind CSS dan bisa dikustomisasi melalui:
- `className` prop untuk styling tambahan
- CSS variables yang sudah didefinisikan di `globals.css`
- Animasi custom yang sudah tersedia

## Dependencies

- `@radix-ui/react-alert-dialog` (sudah terinstall via shadcn/ui)
- `next/image` untuk optimasi gambar
- `tailwindcss` untuk styling
- `@/lib/utils` untuk utility functions

## Tips Penggunaan

1. **Gunakan BearyAlert** untuk kemudahan dan konsistensi
2. **Gunakan Basic Components** jika butuh kontrol penuh
3. **Gunakan useBearyAlert hook** untuk state management yang mudah
4. **Customize title dan description** sesuai konteks aplikasi
5. **Gunakan showSparkles={false}** jika ingin mengurangi animasi

## File Structure

```
src/components/alert/
├── index.tsx              # Export semua komponen
├── success-alert.tsx      # Komponen success alert
├── pending-alert.tsx      # Komponen pending alert
├── failed-alert.tsx       # Komponen failed alert
├── beary-alert.tsx        # Komponen advanced alert
├── example-usage.tsx      # Contoh penggunaan dan hook
└── README.md              # Dokumentasi ini
```

Happy coding! 🎉🐻
