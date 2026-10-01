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
    """Generate a PDF invoice for the given order with full product details and price breakdown."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
    import io
    from django.core.files.base import ContentFile
    from decimal import Decimal
    
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
    
    # GST rate
    gst_rate = Decimal('0.03')
    
    # Prepare items with full details and price breakdown
    items_data = []
    grand_gold_value = Decimal('0')
    grand_diamond_value = Decimal('0')
    grand_color_stone_value = Decimal('0')
    grand_making = Decimal('0')
    grand_gst = Decimal('0')
    
    for item in order.items.all():
        product = item.instance
        unit_price_incl_gst = item.unit_price
        unit_price_base = unit_price_incl_gst / (Decimal('1') + gst_rate)
        line_total_incl_gst = unit_price_incl_gst * item.quantity
        line_total_base = unit_price_base * item.quantity
        gst_on_line = line_total_incl_gst - line_total_base
        
        # Calculate price breakdown using Product's properties
        gold_value = product.gold_value if product else Decimal('0')
        diamond_value = product.diamond_value if product else Decimal('0')
        color_stone_value = product.color_stone_value if product else Decimal('0')
        making = product.making_charges if product else Decimal('0')
        
        grand_gold_value += gold_value * item.quantity
        grand_diamond_value += diamond_value * item.quantity
        grand_color_stone_value += color_stone_value * item.quantity
        grand_making += making * item.quantity
        grand_gst += gst_on_line
        
        items_data.append({
            'item_code': product.item_code if product else 'MTO-PENDING',
            'name': item.product_name,
            'karat': product.karat if product else (item.mto_karat or 'TBD'),
            'gold_color': product.gold_color if product else (item.mto_gold_color or 'TBD'),
            'ring_size': product.ring_size if product else (item.mto_ring_size or None),
            'net_weight': float(product.actual_net_weight) if product else None,
            'diamond_grade': product.diamond_grade if product else (item.mto_diamond_grade or 'TBD'),
            'diamond_weight': float(product.actual_diamond_weight) if product else None,
            'color_stone_weight': float(product.actual_color_stone_weight) if product else None,
            'report_lab': product.report_lab if product else 'TBD',
            'report_number': product.report_number if product else None,
            'hallmark_numbers': product.hallmark_numbers if product else [],
            'quantity': item.quantity,
            'unit_price': float(unit_price_incl_gst),
            'line_total': float(line_total_incl_gst),
            'gold_value': float(gold_value),
            'diamond_value': float(diamond_value),
            'color_stone_value': float(color_stone_value),
            'making': float(making),
            'gst_amount': float(gst_on_line),
        })
    
    # Build PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15*mm,
        leftMargin=15*mm,
        topMargin=15*mm,
        bottomMargin=15*mm
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    company_name_style = ParagraphStyle(
        'CompanyName',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.HexColor('#1A2536'),
        spaceAfter=2*mm,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    )
    
    gst_style = ParagraphStyle(
        'GSTStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#1A2536'),
        spaceAfter=6*mm,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    )
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#B86B5A'),
        spaceAfter=4*mm,
        spaceBefore=2*mm,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading3'],
        fontSize=11,
        textColor=colors.HexColor('#1A2536'),
        spaceAfter=3*mm,
        spaceBefore=4*mm,
        fontName='Helvetica-Bold',
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#666666'),
        fontName='Helvetica',
    )
    
    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#1A2536'),
        fontName='Helvetica-Bold',
    )
    
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER,
    )
    
    # ── HEADER ──
    elements.append(Paragraph("YA-RA JEWELS", company_name_style))
    elements.append(Paragraph("Luxury Diamond & Gold Jewellery", ParagraphStyle(
        'Tagline', parent=styles['Normal'], fontSize=9, 
        textColor=colors.HexColor('#B86B5A'), alignment=TA_CENTER, spaceAfter=1*mm
    )))
    elements.append(Paragraph("GSTIN: 06ACVPG4712C1ZR", gst_style))
    elements.append(Paragraph("TAX INVOICE", title_style))
    
    # ── Invoice Details ──
    invoice_data = [
        ['Invoice No:', invoice_number, 'Date:', timezone.now().strftime('%d %B %Y')],
        ['Order No:', order.order_number, 'Payment:', order.get_payment_method_display()],
    ]
    invoice_table = Table(invoice_data, colWidths=[25*mm, 55*mm, 25*mm, 55*mm])
    invoice_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTNAME', (3, 0), (3, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1A2536')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 6*mm))
    
    # ── Billing Address ──
    elements.append(Paragraph("BILL TO:", heading_style))
    if billing_address:
        elements.append(Paragraph(billing_address.replace('\n', '<br/>'), styles['Normal']))
    elements.append(Paragraph(f"Email: {customer_email}", styles['Normal']))
    if customer_phone:
        elements.append(Paragraph(f"Phone: {customer_phone}", styles['Normal']))
    elements.append(Spacer(1, 6*mm))
    
    # ── Order Items with Full Details ──
    elements.append(Paragraph("ORDER DETAILS:", heading_style))
    
    for idx, item in enumerate(items_data, start=1):
        # Item header row
        item_header = f"{idx}. {item['item_code']} — {item['name']}"
        if item['ring_size']:
            item_header += f" (Size {item['ring_size']})"
        
        elements.append(Paragraph(item_header, ParagraphStyle(
            'ItemHeader', parent=styles['Normal'], fontSize=10,
            textColor=colors.HexColor('#1A2536'), fontName='Helvetica-Bold',
            spaceBefore=4*mm, spaceAfter=2*mm
        )))
        
        # Item specifications
        specs_data = [
            ['Gold:', f"{item['karat']} {item['gold_color']}",
             'Diamond Grade:', item['diamond_grade']],
            ['Net Weight:', f"{item['net_weight']:.3f} g" if item['net_weight'] else 'TBD',
             'Diamond Weight:', f"{item['diamond_weight']:.2f} Ct" if item['diamond_weight'] else 'TBD'],
            ['Color Stone:', f"{item['color_stone_weight']:.2f} Ct" if item['color_stone_weight'] else '0.00 Ct',
             'Qty:', str(item['quantity'])],
        ]
        
        specs_table = Table(specs_data, colWidths=[25*mm, 45*mm, 25*mm, 45*mm])
        specs_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTNAME', (3, 0), (3, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
            ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#666666')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1A2536')),
            ('TEXTCOLOR', (3, 0), (3, -1), colors.HexColor('#1A2536')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
        ]))
        elements.append(specs_table)
        
        # Certification & Hallmark
        cert_text = ""
        if item['report_lab'] and item['report_lab'] != 'TBD':
            cert_text = f"Certified by: {item['report_lab']}"
            if item['report_number']:
                cert_text += f" | Report: {item['report_number']}"
        
        if item['hallmark_numbers']:
            huid_list = ', '.join(item['hallmark_numbers'])
            cert_text += f" | HUID: {huid_list}"
        
        if cert_text:
            elements.append(Paragraph(cert_text, ParagraphStyle(
                'CertText', parent=styles['Normal'], fontSize=8,
                textColor=colors.HexColor('#B86B5A'), fontName='Helvetica-Bold',
                spaceBefore=2*mm
            )))
        
        # Price breakdown for this item
        breakdown_data = [
            ['Gold Value:', f"Rs. {item['gold_value']:,.2f}",
             'Diamond Value:', f"Rs. {item['diamond_value']:,.2f}"],
            ['Color Stone:', f"Rs. {item['color_stone_value']:,.2f}",
             'Making:', f"Rs. {item['making']:,.2f}"],
            ['GST (3%):', f"Rs. {item['gst_amount']:,.2f}",
             'Line Total:', f"Rs. {item['line_total']:,.2f}"],
        ]
        
        breakdown_table = Table(breakdown_data, colWidths=[25*mm, 45*mm, 25*mm, 45*mm])
        breakdown_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTNAME', (3, 0), (3, -1), 'Helvetica'),
            ('FONTNAME', (2, -1), (3, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#333333')),
            ('TEXTCOLOR', (2, -1), (3, -1), colors.HexColor('#1A2536')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ('LINEABOVE', (2, -1), (3, -1), 0.5, colors.HexColor('#B86B5A')),
        ]))
        elements.append(breakdown_table)
    
    elements.append(Spacer(1, 8*mm))
    
    # ── Order Totals ──
    elements.append(Paragraph("ORDER SUMMARY:", heading_style))
    
    grand_base = float(grand_gold_value + grand_diamond_value + grand_color_stone_value + grand_making)
    grand_total = float(order.total)
    grand_gst_float = grand_total - grand_base
    
    totals_data = [
        ['Gold Value:', f"Rs. {float(grand_gold_value):,.2f}"],
        ['Diamond Value:', f"Rs. {float(grand_diamond_value):,.2f}"],
        ['Color Stone Value:', f"Rs. {float(grand_color_stone_value):,.2f}"],
        ['Making Charges:', f"Rs. {float(grand_making):,.2f}"],
        ['Subtotal (excl. tax):', f"Rs. {grand_base:,.2f}"],
        ['GST (3%):', f"Rs. {grand_gst_float:,.2f}"],
        ['Shipping:', f"Rs. {float(order.shipping_fee):,.2f}"],
        ['GRAND TOTAL:', f"Rs. {grand_total:,.2f}"],
    ]
    
    totals_table = Table(totals_data, colWidths=[130*mm, 40*mm])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -2), 9),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('TEXTCOLOR', (0, 0), (-1, -2), colors.HexColor('#333333')),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#1A2536')),
        ('LINEABOVE', (0, -1), (-1, -1), 1.5, colors.HexColor('#B86B5A')),
        ('TOPPADDING', (0, -1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 12*mm))
    
    # ── Amount in Words ──
    def number_to_words_indian(num):
        """Convert number to Indian words (simplified)."""
        ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
                'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
                'Seventeen', 'Eighteen', 'Nineteen']
        tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
        
        def convert_below_1000(n):
            if n == 0:
                return ''
            elif n < 20:
                return ones[n]
            elif n < 100:
                return tens[n // 10] + (' ' + ones[n % 10] if n % 10 else '')
            else:
                return ones[n // 100] + ' Hundred' + (' ' + convert_below_1000(n % 100) if n % 100 else '')
        
        n = int(num)
        if n == 0:
            return 'Zero'
        
        result = ''
        crore = n // 10000000
        lakh = (n % 10000000) // 100000
        thousand = (n % 100000) // 1000
        rest = n % 1000
        
        if crore:
            result += convert_below_1000(crore) + ' Crore '
        if lakh:
            result += convert_below_1000(lakh) + ' Lakh '
        if thousand:
            result += convert_below_1000(thousand) + ' Thousand '
        if rest:
            result += convert_below_1000(rest)
        
        return result.strip()
    
    amount_words = number_to_words_indian(grand_total)
    elements.append(Paragraph(
        f"<b>Amount in Words:</b> {amount_words} Rupees Only",
        ParagraphStyle('AmountWords', parent=styles['Normal'], fontSize=9,
                      textColor=colors.HexColor('#1A2536'), spaceBefore=4*mm)
    ))
    elements.append(Spacer(1, 8*mm))
    
    # ── Terms & Signature ──
    elements.append(Paragraph("TERMS & CONDITIONS:", heading_style))
    terms = [
        "• All jewellery is BIS Hallmarked and certified by reputed laboratories.",
        "• 30-day manufacturing warranty on craftsmanship.",
        "• Lifetime maintenance and cleaning service complimentary.",
        "• All shipments are fully insured during transit.",
        "• This is a computer-generated invoice and does not require a physical signature.",
    ]
    for term in terms:
        elements.append(Paragraph(term, ParagraphStyle(
            'TermItem', parent=styles['Normal'], fontSize=8,
            textColor=colors.HexColor('#666666'), spaceBefore=1*mm
        )))
    
    elements.append(Spacer(1, 12*mm))
    elements.append(Paragraph("For <b>YA-RA JEWELS</b>", ParagraphStyle(
        'Signature', parent=styles['Normal'], fontSize=10,
        textColor=colors.HexColor('#1A2536'), alignment=TA_RIGHT
    )))
    elements.append(Paragraph("<i>Authorized Signatory</i>", ParagraphStyle(
        'Signatory', parent=styles['Normal'], fontSize=8,
        textColor=colors.grey, alignment=TA_RIGHT
    )))
    
    # Build PDF
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