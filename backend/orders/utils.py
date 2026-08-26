import os
from io import BytesIO
from decimal import Decimal
from django.conf import settings
from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
from django.utils import timezone

from .models import Invoice


def generate_invoice_pdf(order):
    """Generate a PDF invoice for the given order and save it."""
    
    # Prepare data
    customer_name = f"{order.user.first_name} {order.user.last_name}".strip() or order.user.email
    customer_email = order.user.email
    customer_phone = getattr(order.user, 'phone', '') or ''
    
    # Build billing address
    if order.address:
        addr = order.address
        billing_address = f"{addr.full_name}\n{addr.line1}"
        if addr.line2:
            billing_address += f"\n{addr.line2}"
        billing_address += f"\n{addr.city}, {addr.state} - {addr.pincode}"
        billing_address += f"\nPhone: {addr.phone}"
    else:
        billing_address = "No address recorded"
    
    # Calculate GST
    gst_percentage = Decimal('3.00')  # Default, can be pulled from RateCard
    gst_amount = order.subtotal * (gst_percentage / Decimal('100'))
    total = order.subtotal + gst_amount + order.shipping_fee
    
    # Generate PDF
    buffer = BytesIO()
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
    
    # Custom styles
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
        ['Invoice Number:', f"INV-{timezone.now().year}-{'00001'}", 'Date:', timezone.now().strftime('%d %B %Y')],
        ['Order Number:', order.order_number, 'Payment Method:', order.get_payment_method_display()],
    ]
    
    invoice_table = Table(invoice_data, colWidths=[40*mm, 50*mm, 40*mm, 50*mm])
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
    elements.append(Paragraph(billing_address.replace('\n', '<br/>'), styles['Normal']))
    elements.append(Paragraph(f"Email: {customer_email}", styles['Normal']))
    if customer_phone:
        elements.append(Paragraph(f"Phone: {customer_phone}", styles['Normal']))
    elements.append(Spacer(1, 8*mm))
    
    # Items table
    elements.append(Paragraph("ORDER DETAILS:", heading_style))
    
    item_data = [['Item', 'Variant', 'Hallmark', 'Certificate', 'Qty', 'Unit Price', 'Total']]
    
    for item in order.items.all():
        product = item.instance
        hallmark = product.hallmark_number if product and product.hallmark_number else '—'
        certificate = product.report_number if product and product.report_number else '—'
        
        item_data.append([
            Paragraph(item.product_name, styles['Normal']),
            Paragraph(item.variant_label or '—', styles['Normal']),
            hallmark,
            certificate,
            str(item.quantity),
            f"₹{item.unit_price:,.2f}",
            f"₹{item.line_total:,.2f}"
        ])
    
    item_table = Table(item_data, colWidths=[45*mm, 35*mm, 20*mm, 25*mm, 15*mm, 25*mm, 25*mm])
    item_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f5f5f0')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1a1a1a')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (4, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(item_table)
    elements.append(Spacer(1, 8*mm))
    
    # Totals
    totals_data = [
        ['Subtotal:', f"₹{order.subtotal:,.2f}"],
        ['GST (3%):', f"₹{gst_amount:,.2f}"],
        ['Shipping:', f"₹{order.shipping_fee:,.2f}"],
        ['TOTAL:', f"₹{total:,.2f}"],
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
    
    # Build PDF
    doc.build(elements)
    
    # Save to file
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return ContentFile(pdf_content, name=f"invoice_{order.order_number}.pdf")


def generate_invoice_for_order(order):
    """Generate and save invoice for an order."""
    
    # Check if invoice already exists
    if hasattr(order, 'invoice') and order.invoice:
        return order.invoice
    
    # Generate PDF
    pdf_file = generate_invoice_pdf(order)
    
    # Calculate GST
    gst_percentage = Decimal('3.00')
    gst_amount = order.subtotal * (gst_percentage / Decimal('100'))
    
    # Build billing address
    if order.address:
        addr = order.address
        billing_address = f"{addr.full_name}\n{addr.line1}"
        if addr.line2:
            billing_address += f"\n{addr.line2}"
        billing_address += f"\n{addr.city}, {addr.state} - {addr.pincode}\n{addr.phone}"
    else:
        billing_address = "No address recorded"
    
    # Create invoice
    invoice = Invoice.objects.create(
        order=order,
        pdf_file=pdf_file,
        subtotal=order.subtotal,
        gst_amount=gst_amount,
        gst_percentage=gst_percentage,
        total=order.total,
        customer_name=f"{order.user.first_name} {order.user.last_name}".strip() or order.user.email,
        customer_email=order.user.email,
        customer_phone=getattr(order.user, 'phone', '') or '',
        billing_address=billing_address
    )
    
    return invoice