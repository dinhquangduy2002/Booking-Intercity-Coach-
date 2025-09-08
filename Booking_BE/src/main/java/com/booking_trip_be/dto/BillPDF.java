package com.booking_trip_be.dto;

import com.booking_trip_be.entity.Booking;
import com.lowagie.text.*;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class BillPDF {
    private Booking booking;

    public BillPDF(Booking booking) {
        this.booking = booking;
    }

    private Font getFont() {
        return FontFactory.getFont("resources/fonts/times.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, 12);
    }

    private void writeTableHeader(PdfPTable table) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(Color.BLUE);
        cell.setPadding(7);

        Font font = getFont();
        font.setColor(Color.WHITE);

        cell.setPhrase(new Phrase("STT", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Tên chuyến đi", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Điểm đón", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Điểm trả", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Số lượng ghế", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Ngày khởi hành", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Giờ di chuyển", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Tổng tiền", font));
        table.addCell(cell);
    }

    private void writeTableData(PdfPTable table) {
        Font font = getFont();
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        table.addCell(new Phrase("1", font));
        table.addCell(new Phrase(booking.getTrip().getName(), font));
        table.addCell(new Phrase(booking.getPickUp(), font));
        table.addCell(new Phrase(booking.getDestination(), font));
        table.addCell(new Phrase(String.valueOf(booking.getQuantity()), font));
        table.addCell(new Phrase(formatDate(booking.getTrip().getDepartureDate()), font));
        table.addCell(new Phrase(booking.getTime(), font));
        table.addCell(new Phrase(currencyFormatter.format(booking.getTotal()), font));
    }

    public void export(ByteArrayOutputStream outputStream) throws DocumentException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, outputStream);

        document.open();

        Font titleFont = getFont();
        titleFont.setSize(18);
        titleFont.setColor(Color.BLUE);

        Paragraph title = new Paragraph("HÓA ĐƠN ĐẶT XE", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        title.setSpacingAfter(10f);
        document.add(title);

        Font infoFont = getFont();
        infoFont.setSize(12);

        // Thông tin khách hàng
        Paragraph info = new Paragraph(
                "Ngày đặt: " + formatDateTime(booking.getCreate_at()) + "\n" +
                        "Mã hóa đơn: " + booking.getId() + "\n" +
                        "Tên khách hàng: " + booking.getAccount().getLastname() + " " + booking.getAccount().getFirstname() + "\n" +
                        "Mã khách hàng: " + booking.getAccount().getId() + "\n" +
                        "Số điện thoại: " + booking.getAccount().getPhone(),
                infoFont
        );
        info.setSpacingAfter(15f);
        document.add(info);

        // Bảng thông tin vé
        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100f);
        table.setWidths(new float[]{1.2f, 4f, 3.5f, 3.5f, 2.5f, 3f, 2.5f, 3f});
        table.setSpacingBefore(10);
        writeTableHeader(table);
        writeTableData(table);
        document.add(table);

        document.close();
    }

    private String formatDate(LocalDate date) {
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }
}
