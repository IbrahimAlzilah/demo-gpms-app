export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-4">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} نظام إدارة تقييم مشاريع التخرج. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  )
}

