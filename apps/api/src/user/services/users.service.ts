import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from 'role/entities/role.entity';

import { CreateUserDto } from '../dto/create_user.dto';
import { UpdateUserDto } from '../dto/update_user.dto';

import { RolesEnum } from 'utils/enums/roles/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,

    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  // CREATE FUNTIONS //

  async createUserWithRole(
    userDto: CreateUserDto,
    userRole: RolesEnum,
  ): Promise<User> {
    const userFound = await this.userRepository.findOne({
      where: { id_number: userDto.id_number },
    });

    if (userFound) {
      throw new HttpException(
        `El usuario con número de identificación ${userDto.id_number} ya está registrado.`,
        HttpStatus.CONFLICT,
      );
    }

    const emailFound = await this.userRepository.findOne({
      where: { email: userDto.email },
    });

    if (emailFound) {
      throw new HttpException(
        `El correo ${userDto.email} ya está registrado.`,
        HttpStatus.CONFLICT,
      );
    }

    const userCreate = this.userRepository.create(userDto);

    const roleEntity = await this.roleRepository.findOne({
      where: { name: userRole },
    });

    if (!roleEntity) {
      throw new HttpException(
        `El rol ${userRole} no existe.`,
        HttpStatus.CONFLICT,
      );
    }

    userCreate.role = [roleEntity];

    const userSaved = await this.userRepository.save(userCreate);

    return this.userRepository.findOne({
      where: { id: userSaved.id },
      loadRelationIds: true,
    });
  }

  // GET FUNTIONS //

  async getAllUsers() {
    const allUsers = await this.userRepository.find({
      order: {
        name: 'ASC',
      },
      loadEagerRelations: false,
      loadRelationIds: true,
    });

    if (!allUsers.length) {
      throw new HttpException(
        `No hay usuarios registrados en la base de datos`,
        HttpStatus.NOT_FOUND,
      );
    } else {
      return allUsers;
    }
  }

  async getAllActiveUsers() {
    const allUsers = await this.userRepository.find({
      where: {
        is_active: true,
      },
      order: {
        name: 'ASC',
      },
      loadEagerRelations: false,
      loadRelationIds: true,
    });

    if (!allUsers.length) {
      throw new HttpException(
        `No hay usuarios registrados en la base de datos`,
        HttpStatus.NOT_FOUND,
      );
    } else {
      return allUsers;
    }
  }

  async getUserByIdNumberAndRole(idNumber: string, userRoles: RolesEnum[]) {
    const userFound = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .where('user.id_number = :idNumber', { idNumber })
      .andWhere('role.name IN (:...roles)', { roles: userRoles })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .getOne();

    if (userFound) {
      throw new HttpException(
        `El usuario con número de identificación: ${idNumber} ya esta registrado.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return userFound;
  }

  async getUserByIdNumber(id_number: string) {
    return await this.userRepository.findOneBy({
      id_number: id_number,
    });
  }

  async getUserActiveByIdNumber(id_number: string) {
    return await this.userRepository.findOneBy({
      id_number: id_number,
      is_active: true,
    });
  }

  async getUserActiveByEmail(email: string) {
    return await this.userRepository.findOneBy({
      email: email,
      is_active: true,
    });
  }

  async getUserById(id: string) {
    const userFound = await this.userRepository.findOne({
      where: {
        id: id,
      },
      loadEagerRelations: false,
      loadRelationIds: true,
    });

    if (!userFound) {
      throw new HttpException(`Usuario no encontrado.`, HttpStatus.NOT_FOUND);
    } else {
      return userFound;
    }
  }

  async getUserFoundByEmailWithPassword(principalEmail: string) {
    return await this.userRepository.findOne({
      where: {
        email: principalEmail,
        is_active: true,
      },
      select: [
        'id',
        'name',
        'last_name',
        'id_number',
        'password',
        'email',
        'cellphone',
        'role',
      ],
      loadEagerRelations: false,
    });
  }

  async getUserActiveByEmailAndCode(
    userEmail: string,
    verificationCode: number,
  ) {
    return await this.userRepository.findOne({
      where: {
        email: userEmail,
        verification_code: verificationCode,
        is_active: true,
      },
      select: ['id', 'name', 'last_name', 'email', 'id_number'],
      loadEagerRelations: false,
      relations: { role: true },
    });
  }

  async getUserRoles(idNumber: string) {
    const userFound = await this.userRepository.findOne({
      where: { id_number: idNumber, is_active: true },
    });

    if (!userFound) {
      throw new HttpException(`Usuario no encontrado.`, HttpStatus.NOT_FOUND);
    }

    if (!userFound.role.length) {
      throw new HttpException(
        `Este usuario no tiene roles asignados.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const transformedRoles = userFound.role.map((role) => ({
      id: role.id,
      name: role.name,
    }));

    return transformedRoles;
  }

  // UPDATE FUNTIONS //

  async updateUser(id: string, updateUser: UpdateUserDto) {
    const userFound = await this.userRepository.findOneBy({
      id,
    });

    if (!userFound) {
      throw new HttpException(`Usuario no encontrado.`, HttpStatus.NOT_FOUND);
    }

    const emailUserValidate = await this.userRepository.findOne({
      where: {
        id: Not(userFound.id),
        email: updateUser.email,
      },
    });

    if (updateUser.email && emailUserValidate) {
      throw new HttpException(
        `El correo electrónico ${updateUser.email} ya está registrado.`,
        HttpStatus.CONFLICT,
      );
    }

    const emailCellphoneUserValidate = await this.userRepository.findOne({
      where: {
        id: Not(userFound.id),
        email: updateUser.email,
      },
    });

    if (updateUser.cellphone && emailCellphoneUserValidate) {
      throw new HttpException(
        `El número de celular ${updateUser.cellphone} ya está registrado.`,
        HttpStatus.CONFLICT,
      );
    }

    const { roleIdsToAdd, ...userUpdates } = updateUser;

    const userUpdate = await this.userRepository.update(id, userUpdates);

    if (roleIdsToAdd) {
      await this.updateUserRoles(id, roleIdsToAdd);
    }

    if (userUpdate.affected === 0) {
      throw new HttpException(`Usuario no encontrado`, HttpStatus.NOT_FOUND);
    }

    throw new HttpException(
      `¡Datos y roles guardados correctamente!`,
      HttpStatus.ACCEPTED,
    );
  }

  private async updateUserRoles(id: string, roleIdsToAdd: number[]) {
    const userFound = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userFound) {
      throw new HttpException(`Usuario no encontrado.`, HttpStatus.NOT_FOUND);
    }

    if (roleIdsToAdd && roleIdsToAdd.length > 0) {
      const rolesToAdd = await this.roleRepository.findBy({
        id: In(roleIdsToAdd),
      });

      if (rolesToAdd.length !== roleIdsToAdd.length) {
        throw new HttpException(
          `Uno o más roles no existen`,
          HttpStatus.NOT_FOUND,
        );
      }

      userFound.role = rolesToAdd;
    }

    await this.userRepository.save(userFound);
  }

  // TODO FUNCIONES DE CONTRASEÑA ADICIONALES PARA EL FUTURO //

  async updateUserPassword() {}

  async forgotUserPassword() {}

  async resetUserPassword() {}

  // DELETED-BAN FUNTIONS //

  async banUser(id: string) {
    const userFound = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!userFound) {
      throw new HttpException(`Usuario no encontrado.`, HttpStatus.NOT_FOUND);
    }

    userFound.is_active = !userFound.is_active;

    await this.userRepository.save(userFound);

    const statusMessage = userFound.is_active
      ? `El usuario con número de ID: ${userFound.id_number} se ha ACTIVADO.`
      : `El usuario con número de ID: ${userFound.id_number} se ha INACTIVADO.`;

    throw new HttpException(statusMessage, HttpStatus.ACCEPTED);
  }
}
