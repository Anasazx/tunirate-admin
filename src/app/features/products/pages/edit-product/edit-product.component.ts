import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DetailedProductResponse } from '../../models/productDTO/detailedProductResponse.model';
import { CompanyResponse } from '../../../companies/models/companyDTO/companyResponse.model';
import { SubcategoryResponse } from '../../../category/models/subcategoryDTO/subcategoryResponse.model';
import { ProductRequest } from '../../models/productDTO/productRequest.model';
import { ProductStatus } from '../../enums/productStatus.enum.model';

import { ProductService } from '../../services/productService/product.service';
import { CompanyService } from '../../../companies/services/companyService/company.service';
import { ProductImageService } from '../../../../core/services/productImageService/productImage.service';
import { SubcategoryService } from '../../../category/services/subcategoryService/subcategory.service';
import { SharedService } from '../../../../core/services/sharedService/shared.service';


@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent implements OnInit, OnDestroy {

  loading = false;
  companiesLoading = false;
  saving = false;
  imageSaving = false;
  error: string | null = null;

  product: DetailedProductResponse | null = null;

  companies: CompanyResponse[] = [];
  subcategories: SubcategoryResponse[] = [];

  selectedSubcategoryId: number | null = null;

  selectedFiles: File[] = [];

  previewUrls: string[] = [];

  productStatusValues = Object.values(ProductStatus);

  @ViewChild('fileInput')
  fileInput?: ElementRef<HTMLInputElement>;

  pendingDeleteId?: number;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private companyService: CompanyService,
    private productImageService: ProductImageService,
    private router: Router,
    private subcategoryService: SubcategoryService,
    public sharedService: SharedService
  ) {}



  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadCompanies();
    this.loadSubcategories();

    if (!id) {
      this.error = "Invalid product id";
      return;
    }
    this.load(id);
  }

  loadCompanies() {
    this.companiesLoading = true;
    this.companyService.getAllCompanies()
      .subscribe({
        next: res => {
          this.companies = res;
          this.companiesLoading = false;
          this.resolveCompanySelection();
        },
        error: err => {
          console.error(err);
          this.companiesLoading = false;
        }
      });
  }

  loadSubcategories() {
    this.subcategoryService.getAllSubcategories()
      .subscribe({
        next: res => {
          this.subcategories = res;
          this.syncSubcategory();
        },
        error: err => {
          console.error(err);
        }
      });
  }

  load(id:number) {
    this.loading = true;
    this.error = null;
    this.productService
      .getDetailedProductByIdAsAdmin(id)
      .subscribe({
        next: product => {
          this.product = product;
          this.resolveCompanySelection();
          this.syncSubcategory();
          this.loading = false;
        },

        error: err => {
          console.error(err);
          this.error = "Failed to load product";
          this.loading = false;
        }
      });
  }

  private syncSubcategory() {
    if(!this.product || this.subcategories.length === 0) return;
    if(this.product.subcategoryId){
      this.selectedSubcategoryId = Number(this.product.subcategoryId);
      return;
    }




    if(this.product.subcategoryName){

      const matched = this.subcategories.find(s => s.name.toLowerCase() === this.product!.subcategoryName!.toLowerCase());

      if(matched){
        this.selectedSubcategoryId = matched.id;
      }
    }
  }

  save() {

    if(!this.product) return;

    if(!this.product.companyId){
      this.error = "Please select a company";
      return;
    }

    this.saving = true;

    const payload: ProductRequest = {
      name: this.product.name,
      description: this.product.description ?? null,
      subcategoryId: this.selectedSubcategoryId ? String(this.selectedSubcategoryId) : "", companyId: this.product.companyId, status: this.product.status
    };

    this.productService.updateProductAsAdmin(this.product.id, payload, this.selectedFiles).subscribe({
        next: updated => {
          this.product = updated;
          this.selectedFiles = [];
          this.clearPreview();
          this.saving = false;
          this.router.navigate(['/admin/products']);
        },
        error: err => {
          console.error("Save failed", err);
          this.error = "Failed to save product";
          this.saving = false;
        }
      });
  }

  onFileSelected(event:Event){

    const input = event.target as HTMLInputElement;

    if(!input.files?.length) return;

    const files = Array.from(input.files);

    for(const file of files){
      if(!file.type.startsWith("image/")){
        this.error = "Only images are allowed";
        return;
      }
      if(file.size > 5 * 1024 * 1024){
        this.error = "Images must be smaller than 5MB";
        return;
      }
    }
    this.error = null;
    this.selectedFiles.push(...files);
    files.forEach(file => {
      this.previewUrls.push(URL.createObjectURL(file));
    });
  }

  removeSelectedFile(index:number){
    this.selectedFiles.splice(index, 1);
    URL.revokeObjectURL(this.previewUrls[index]);
    this.previewUrls.splice(index, 1);
  }

  clearPreview(){
    this.previewUrls.forEach(url => URL.revokeObjectURL(url));
    this.previewUrls = [];
    if(this.fileInput?.nativeElement){
      this.fileInput.nativeElement.value = '';
    }
  }

  private resolveCompanySelection(){
    if(!this.product || this.companies.length === 0) return;
    if(!this.product.companyId && this.product.companyName){
      const company = this.companies.find(c => c.name.toLowerCase() === this.product!.companyName.toLowerCase());
      if(company){
        this.product.companyId = company.id;
      }
    }
  }

  setMainImage(imageId:number){
    if(!this.product) return;
    this.imageSaving = true;
    this.productImageService
      .setMainImage(imageId, this.product.id)
      .subscribe({
        next:()=>{
          this.imageSaving = false;
          this.load(this.product!.id);
        },
        error:err=>{
          console.error(err);
          this.error = "Failed to set main image";
          this.imageSaving=false;
        }
      });
  }

  deleteImage(imageId:number){
    this.pendingDeleteId = imageId;
  }

  back(){
    this.router.navigate(['/admin/products']);
  }

  get mainImageUrl():string|null{
    return (this.product?.images?.find(img => img.isMain)?.url ?? this.product?.images?.[0]?.url ?? null);
  }

  ngOnDestroy(){
    this.clearPreview();
  }

}
