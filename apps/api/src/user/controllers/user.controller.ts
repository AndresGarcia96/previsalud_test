import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Auth } from 'auth/decorators/auth.decorator';

import { UpdateUserDto } from '../dto/update_user.dto';

import { RolesEnum } from 'utils/enums/roles/roles.enum';

@ApiTags('users')
@ApiBearerAuth()
@Auth(RolesEnum.SUPER_ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET METHODS //

  @Auth(RolesEnum.ADMIN)
  @Get('/getAllUsers')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Auth(RolesEnum.ADMIN)
  @Get('/getAllActiveUsers')
  async getAllActiveUsers() {
    return this.usersService.getAllActiveUsers();
  }

  @Auth(RolesEnum.ADMIN)
  @Get('/getUserById:id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Auth(RolesEnum.ADMIN, RolesEnum.USER, RolesEnum.AUDITOR)
  @Get('/getAnyUserByIdNumber/:idNumber')
  async getAnyUserByIdNumber(@Param('idNumber') idNumber: string) {
    return this.usersService.getUserByIdNumber(idNumber);
  }

  @Auth(RolesEnum.ADMIN)
  @Get('/getUserRoles/:idNumber')
  async getUserRoles(@Param('idNumber') idNumber: string) {
    return this.usersService.getUserRoles(idNumber);
  }

  @Get('/getAdminUserByIdNumber/:idNumber')
  async getAdminUserByIdNumber(@Param('idNumber') idNumber: string) {
    return await this.usersService.getUserByIdNumberAndRole(idNumber, [
      RolesEnum.ADMIN,
    ]);
  }

  @Get('/getUserByIdNumber/:idNumber')
  async getUserByIdNumber(@Param('idNumber') idNumber: string) {
    return await this.usersService.getUserByIdNumberAndRole(idNumber, [
      RolesEnum.USER,
    ]);
  }

  @Get('/getAuditorUserByIdNumber/:idNumber')
  async getAuditorUserByIdNumber(@Param('idNumber') idNumber: string) {
    return await this.usersService.getUserByIdNumberAndRole(idNumber, [
      RolesEnum.AUDITOR,
    ]);
  }

  // PATCH METHODS //

  @Auth(RolesEnum.ADMIN)
  @Patch('/updateUser/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Auth(RolesEnum.ADMIN)
  @Patch('/banUser/:id')
  async banUser(@Param('id') id: string) {
    return this.usersService.banUser(id);
  }
}
