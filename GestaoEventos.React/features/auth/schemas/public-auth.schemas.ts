import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Use no minimo 8 caracteres.')
  .regex(/[A-Za-z]/, 'Use pelo menos uma letra.')
  .regex(/[0-9]/, 'Use pelo menos um numero.');

export const loginSchema = z.object({
  login: z.string().min(1, 'Informe e-mail ou login.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});

export const signupSchema = z
  .object({
    convite: z.string().optional().nullable(),
    nome: z.string().optional(),
    email: z.string().email('Informe um e-mail valido.'),
    senha: passwordSchema,
    confirmarSenha: z.string().min(1, 'Confirme a senha.'),
  })
  .superRefine((value, context) => {
    if (!value.convite && (!value.nome || value.nome.trim().length < 2)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nome'],
        message: 'Informe o nome completo.',
      });
    }

    if (value.senha !== value.confirmarSenha) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmarSenha'],
        message: 'As senhas nao conferem.',
      });
    }
  });

export const recoverPasswordSchema = z.object({
  email: z.string().email('Informe um e-mail valido.'),
});

export const resetPasswordSchema = z
  .object({
    novaSenha: passwordSchema,
    confirmarSenha: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((value) => value.novaSenha === value.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas nao conferem.',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
