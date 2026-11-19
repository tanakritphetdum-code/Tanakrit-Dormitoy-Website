"use client"

import MeadowRiseFooter from "@/components/ui/meadow-rise-footer"

export default function FooterDemo() {
  return (
    <div className="w-full">
      <MeadowRiseFooter
        name="Tanakrit Dormitory"
        heading="เริ่มต้นชีวิตที่สงบและอบอุ่นกับ\n*หอพักชายธนกฤษฎ์* วันนี้"
        subheading="บริการห้องพักรายเดือนคุณภาพสูง 3 อาคาร บรรยากาศเงียบสงบ เป็นส่วนตัว ปลอดภัยตลอด 24 ชั่วโมง"
        cta={{ label: "จองห้องพักทันที", href: "#rooms" }}
        tagline="หอพักชายธนกฤษฎ์ นครศรีธรรมราช (3 อาคาร 17 ห้อง) ใกล้วิทยาลัยช่างศิลป์ นครศรีธรรมราช"
        columns={[
          {
            title: "อาคารและห้องพัก",
            links: [
              { label: "อาคาร ธนกฤษฎ์ (9 ห้อง)", href: "#rooms" },
              { label: "อาคาร กิ่งเพชร (5 ห้อง)", href: "#rooms" },
              { label: "อาคารใต้บ้าน (3 ห้อง)", href: "#rooms" },
              { label: "คำนวณค่าแรกเข้า", href: "#rates" },
            ],
          },
          {
            title: "สิ่งอำนวยความสะดวก",
            links: [
              { label: "ตู้ซักผ้าหยอดเหรียญ", href: "#features" },
              { label: "ตู้กดน้ำดื่มหยอดเหรียญ", href: "#features" },
              { label: "ศาลาส่วนกลาง", href: "#features" },
              { label: "ที่จอดรถ & Wi-Fi", href: "#features" },
            ],
          },
          {
            title: "ระบบและการติดต่อ",
            links: [
              { label: "ติดต่อหอพัก 075-355-289", href: "#contact" },
              { label: "เปิดแผนที่ Google Maps", href: "https://maps.app.goo.gl/AtzLYkyYmNba4XBh8" },
              { label: "Line: Tonyeiei", href: "#contact" },
              { label: "เข้าสู่ระบบจัดการหอพัก", href: "#" },
            ],
          },
        ]}
      />
    </div>
  )
}
