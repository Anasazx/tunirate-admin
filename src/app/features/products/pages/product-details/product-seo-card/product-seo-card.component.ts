import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { ProductService } from '../../../services/productService/product.service';
import { FaqItem, ProductSeo } from '../../../models/productDTO/productSeo.model';
import { ToastService } from '../../../../../core/ui/toast.service';
import { apiErrorMessage } from '../../../../../core/ui/api-error';
import { Globe, LoaderCircle, Plus, Trash2 } from '../../../../../core/ui/icons';

// Hand-written content that makes a product page worth indexing, and the "featured" switch that forces indexing
@Component({
  selector: 'app-product-seo-card',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './product-seo-card.component.html',
})
export class ProductSeoCardComponent implements OnInit {
  @Input({ required: true }) productId!: number;

  private productService = inject(ProductService);
  private toast = inject(ToastService);

  readonly seo = signal<ProductSeo | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);

  featured = false;
  seoDescription = '';
  pros = '';
  cons = '';
  faq: FaqItem[] = [];
  priceTnd: number | null = null;
  whereToBuy = '';

  protected readonly icons = { Globe, LoaderCircle, Plus, Trash2 };

  ngOnInit(): void {
    this.productService.getProductSeo(this.productId).subscribe({
      next: seo => {
        this.fill(seo);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not load the SEO content.'));
      }
    });
  }

  addQuestion() {
    this.faq = [...this.faq, { question: '', answer: '' }];
  }

  removeQuestion(index: number) {
    this.faq = this.faq.filter((_, i) => i !== index);
  }

  save() {
    // Half-filled questions would be rejected by the API, empty ones are just dropped
    const faq = this.faq
      .map(item => ({ question: item.question.trim(), answer: item.answer.trim() }))
      .filter(item => item.question || item.answer);
    if (faq.some(item => !item.question || !item.answer)) {
      this.toast.error('Each FAQ entry needs both a question and an answer.');
      return;
    }

    this.saving.set(true);
    this.productService.updateProductSeo(this.productId, {
      featured: this.featured,
      seoDescription: this.seoDescription,
      pros: this.pros,
      cons: this.cons,
      faq,
      priceTnd: this.priceTnd,
      whereToBuy: this.whereToBuy
    }).subscribe({
      next: seo => {
        this.fill(seo);
        this.saving.set(false);
        this.toast.success('SEO content saved.');
      },
      error: err => {
        this.saving.set(false);
        this.toast.error(apiErrorMessage(err, 'Could not save the SEO content.'));
      }
    });
  }

  private fill(seo: ProductSeo) {
    this.seo.set(seo);
    this.featured = seo.featured;
    this.seoDescription = seo.seoDescription ?? '';
    this.pros = seo.pros ?? '';
    this.cons = seo.cons ?? '';
    this.faq = seo.faq.map(item => ({ ...item }));
    this.priceTnd = seo.priceTnd;
    this.whereToBuy = seo.whereToBuy ?? '';
  }
}
