import io
from decimal import Decimal
from django.core.files.base import ContentFile
from django.utils import timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from .models import Invoice


def get_next_invoice_number():
    """Generate the next unique invoice number."""
    year = timezone.now().year
    year_count = Invoice.objects.filter(generated_at__year=year).count() + 1
    return f"INV-{year}-{year_count:05d}"


def generate_invoice_pdf(order, invoice_number):
    """Generate a PDF invoice for the given order."""
    
    # Customer info
    customer_name = f"{order.user.first_name} {order.user.last_name}".strip() or order.user.email
    customer_email = order.user.email
    customer_phone = getattr(order.user, 'phone', '') or ''
    
    billing_address = ""
    if order.address:
        addr = order.address
        billing_address = f"{addr.full_name}\n{addr.line1}"
        if addr.line2:
            billing_address += f"\n{addr.line2}"
        billing_address += f"\n{addr.city}, {addr.state} - {addr.pincode}"
        if addr.phone:
            billing_address += f"\nPhone: {addr.phone}"
    
    # Calculate GST breakdown (total is GST-inclusive)
    order_total = order.total
    gst_rate = Decimal('0.03')
    base_amount = order_total / (Decimal('1') + gst_rate)
    gst_amount = order_total - base_amount
    
    # Prepare items with base prices (excl. GST)
    items_data = []
    for item in order.items.all():
        product = item.instance
        unit_price_incl_gst = item.unit_price
        unit_price_base = unit_price_incl_gst / (Decimal('1') + gst_rate)
        line_total_base = unit_price_base * item.quantity
        
        items_data.append({
            'name': item.product_name,
            'variant': item.variant_label or '-',
            'quantity': item.quantity,
            'unit_price': unit_price_base,
            'line_total': line_total_base,
            'hallmark': product.hallmark_number if product else '-',
            'report': product.report_number if product else '-',
        })
    
    # Build PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#B08D3E'),
        spaceAfter=6*mm,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=4*mm,
        spaceBefore=6*mm
    )
    
    # Header
    elements.append(Paragraph("YA-RA JEWELS", title_style))
    elements.append(Paragraph("TAX INVOICE", styles['Heading2']))
    elements.append(Spacer(1, 8*mm))
    
    # Invoice details
    invoice_data = [
        ['Invoice No:', invoice_number, 'Date:', timezone.now().strftime('%d %B %Y')],
        ['Order No:', order.order_number, 'Payment:', order.get_payment_method_display()],
    ]
    
    invoice_table = Table(invoice_data, colWidths=[30*mm, 50*mm, 30*mm, 50*mm])
    invoice_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 8*mm))
    
    # Billing address
    elements.append(Paragraph("BILL TO:", heading_style))
    if billing_address:
        elements.append(Paragraph(billing_address.replace('\n', '<br/>'), styles['Normal']))
    elements.append(Paragraph(f"Email: {customer_email}", styles['Normal']))
    if customer_phone:
        elements.append(Paragraph(f"Phone: {customer_phone}", styles['Normal']))
    elements.append(Spacer(1, 8*mm))
    
    # Items table
    elements.append(Paragraph("ORDER DETAILS:", heading_style))
    
    table_data = [
        ['Item', 'Variant', 'Hallmark', 'Diamond Report', 'Qty', 'Unit Price', 'Total']
    ]
    
    for item in items_data:
        table_data.append([
            Paragraph(item['name'], styles['Normal']),
            Paragraph(item['variant'], styles['Normal']),
            item['hallmark'] or '-',
            item['report'] or '-',
            str(item['quantity']),
            f"Rs.{item['unit_price']:,.2f}",
            f"Rs.{item['line_total']:,.2f}",
        ])
    
    items_table = Table(table_data, colWidths=[45*mm, 35*mm, 20*mm, 25*mm, 15*mm, 25*mm, 25*mm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f5f5f0')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1a1a1a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (4, 1), (4, -1), 'CENTER'),
        ('ALIGN', (5, 1), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 8*mm))
    
    # Totals
    totals_data = [
        ['Subtotal (excl. tax):', f"Rs.{base_amount:,.2f}"],
        ['GST (3%):', f"Rs.{gst_amount:,.2f}"],
        ['Shipping:', f"Rs.{order.shipping_fee:,.2f}"],
        ['TOTAL:', f"Rs.{order_total:,.2f}"],
    ]
    
    totals_table = Table(totals_data, colWidths=[130*mm, 40*mm])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),
        ('TOPPADDING', (0, -1), (-1, -1), 8),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 12*mm))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER
    )
    elements.append(Paragraph("Thank you for your purchase!", footer_style))
    elements.append(Paragraph("This is a computer-generated invoice and does not require a signature.", footer_style))
    
    # Build
    doc.build(elements)
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return ContentFile(pdf_content, name=f"invoice_{invoice_number}.pdf")


def generate_invoice_for_order(order):
    """Generate and save invoice for an order."""
    
    # Check if invoice already exists
    try:
        existing = order.invoice
        return existing
    except Invoice.DoesNotExist:
        pass
    
    # Generate invoice number FIRST (before creating PDF)
    invoice_number = get_next_invoice_number()
    
    # Generate PDF (passes invoice_number as parameter)
    pdf_file = generate_invoice_pdf(order, invoice_number)
    
    # Calculate GST breakdown
    gst_rate = Decimal('0.03')
    base_amount = order.total / (Decimal('1') + gst_rate)
    gst_amount = order.total - base_amount
    
    # Build billing address
    if order.address:
        addr = order.address
        billing_address = f"{addr.full_name}\n{addr.line1}"
        if addr.line2:
            billing_address += f"\n{addr.line2}"
        billing_address += f"\n{addr.city}, {addr.state} - {addr.pincode}\n{addr.phone}"
    else:
        billing_address = "No address recorded"
    
    # Create invoice record
    invoice = Invoice.objects.create(
        order=order,
        invoice_number=invoice_number,
        pdf_file=pdf_file,
        subtotal=base_amount,
        gst_amount=gst_amount,
        gst_percentage=Decimal('3.00'),
        total=order.total,
        customer_name=f"{order.user.first_name} {order.user.last_name}".strip() or order.user.email,
        customer_email=order.user.email,
        customer_phone=getattr(order.user, 'phone', '') or '',
        billing_address=billing_address
    )
    
    return invoice